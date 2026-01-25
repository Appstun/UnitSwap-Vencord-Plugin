/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";

// import { lodash } from "@webpack/common";
import { MALFORMED_U_REGEX, NATURAL_UNIT_MAP, NATURAL_UNIT_REGEX, PRESEND_REGEX, PROCESSED_MARKER, UNICODE_EMOJI_RANGE_REGEX } from "./constants";
import { convertUnit } from "./converters/_index";
import { processNodes } from "./parser";
import { settings, SettingsAboutComponent } from "./settings";
import { ContentNode } from "./types";

// Quick-check regex for <uX:...> syntax (non-global for test only)
const QUICK_UNIT_SYNTAX = /<u[TDLWV]:/i;

export const logger = new Logger("UnitSwap", "#f1c40f");


export default definePlugin({
    name: "UnitSwap",
    description: "Converts units inline. Use <uD:16km> for client-side or <u:16km:mi,m> for pre-send. Escape with \\<u (pre-send) or <!u (rendered view).",
    authors: [{ id: 625678351910305802n, name: "Appstun" }],
    settings,

    patches: [
        {
            find: '["strong","em","u","text","inlineCode","s","spoiler"]',
            replacement: {
                match: /(?=return{hasSpoilerEmbeds:\i,content:(\i))/,
                replace: (_, content) => `${content}=$self.transformContent(${content});`
            }
        }
    ],

    transformContent(content: ContentNode[]): ContentNode[] {
        if (!content || !Array.isArray(content)) return content;

        try {
            // quick check if there isn any unit syntax to process
            const contentStr = JSON.stringify(content);
            const hasUnitSyntax = QUICK_UNIT_SYNTAX.test(contentStr);
            const hasNaturalUnits = settings.store.autoDetect && NATURAL_UNIT_REGEX.test(contentStr);
            NATURAL_UNIT_REGEX.lastIndex = 0; // Reset after test

            if (!hasUnitSyntax && !hasNaturalUnits) return content;

            //! testing without deep clone
            // const newContent = lodash.cloneDeep(content);
            // return processNodes(newContent);
            return processNodes(content);
        } catch (err) {
            logger.error("Error transforming content:", err);
            return content;
        }
    },

    // Pre-send conversion: <u:14km:mi,m> → 14km\u200B (8.7mi & 14000m)
    onBeforeMessageSend(_channelId: string, msg: { content: string; }) {
        if (!msg.content) return;

        // Escape emojis inside <u...> tags to prevent interference with unit parsing
        msg.content = msg.content.replace(MALFORMED_U_REGEX, match => {
            return match.replace(new RegExp(UNICODE_EMOJI_RANGE_REGEX, "gu"), emoji => `\\${emoji}`);
        });

        msg.content = msg.content.replace(PRESEND_REGEX, (match, valueStr, rawUnit, targets) => {
            const unitLower = rawUnit.toLowerCase();
            const mapping = NATURAL_UNIT_MAP[unitLower];
            if (!mapping) return match;

            const { type, unit: fromUnit } = mapping;
            const value = parseFloat(valueStr.replace(",", "."));
            if (isNaN(value)) return match;

            const decimalPlaces = settings.store.decimalPlaces ?? 2;
            const autoTrim = settings.store.autoDecimalPlaces ?? true;
            const maxDecimalPlaces = settings.store.maxDecimalPlaces ?? 6;

            const { original } = convertUnit(type, value, fromUnit, fromUnit, decimalPlaces, autoTrim, maxDecimalPlaces);

            const targetUnits = targets.split(",").map((t: string) => t.trim());
            const conversions: string[] = [];

            for (const targetUnit of targetUnits) {
                const targetLower = targetUnit.toLowerCase();
                const targetMapping = NATURAL_UNIT_MAP[targetLower];

                if (!targetMapping || targetMapping.type !== type) continue;
                if (targetMapping.unit === fromUnit) continue;

                const { converted } = convertUnit(type, value, fromUnit, targetMapping.unit, decimalPlaces, autoTrim, maxDecimalPlaces);
                conversions.push(converted);
            }

            if (conversions.length === 0) return match;

            const formatted = conversions.length === 1
                ? conversions[0]
                : conversions.slice(0, -1).join(", ") + " & " + conversions[conversions.length - 1];

            return `${original}${PROCESSED_MARKER} (${formatted})`;
        });
    },

    settingsAboutComponent: SettingsAboutComponent
});
