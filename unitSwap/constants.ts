/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { UNIT_CONFIGS, UnitMapping, UnitMappingNames } from "./types";

// Zero-width space marker to indicate already processed text
export const PROCESSED_MARKER = "\u200B";

// Maps natural unit names to their type and normalized unit representation
// Generated from UNIT_CONFIGS to ensure consistency
export const NATURAL_UNIT_MAP: Partial<Record<UnitMappingNames, UnitMapping>> = (() => {
    const map: Partial<Record<UnitMappingNames, UnitMapping>> = {};

    // Generate mappings from UNIT_CONFIGS
    for (const [typeKey, config] of Object.entries(UNIT_CONFIGS)) {
        for (const unit of config.units) {
            const lowerUnit = unit.value.toLowerCase() as UnitMappingNames;
            map[lowerUnit] = { type: config.type, unit: unit.value as any };

            // Add temperature variants with degree symbol (°C, °F, etc.)
            if (config.type === "T") {
                map[`°${lowerUnit}` as UnitMappingNames] = { type: config.type, unit: unit.value as any };
            }
        }
    }

    return map;
})();


// Reusable regex parts
const VALUE = "(-?[\\d.,]+)"; // Matches numbers like 32.2, -12, 12,423
const UNITS_LIST = Object.keys(NATURAL_UNIT_MAP).sort((a, b) => b.length - a.length).join("|");
const UNITS = `(°?[CFK]|${UNITS_LIST})`; // All supported units (capturing group)
const UNITS_NC = `(?:°?[CFK]|${UNITS_LIST})`; // All supported units (non-capturing)
const TYPES = "([TDLWV])"; // Unit types: Temperature, Distance, Length, Weight, Volume
// Target units: comma-separated list of units (e.g., "mi,m" or "🍎,cm")
const TARGET_UNITS = `(${UNITS_NC}(?:,\\s*${UNITS_NC})*)`;

// Regex: <u[TDWV]:value_with_unit> or <u[TDWV]:value_with_unit:override> (client-side rendering)
// Uses negative lookbehind to ignore escaped \<u
// Optional override unit at the end: <uT:13°C:K> displays in K, tooltip shows user preference
export const UNIT_REGEX = new RegExp(`(?<!\\\\)<u${TYPES}:${VALUE}\\s*${UNITS}(?::${UNITS})?>`, "gi");

// Regex to match escaped syntax <!uX:...> (will be displayed as plain text <uX:...>)
// Use <!uD:16km> to show the tag without conversion
//! Using <!u instead of \<u because Discord strips the backslash on render before the plugin gets it
export const ESCAPED_UNIT_REGEX = new RegExp(`<!u${TYPES}:${VALUE}\\s*${UNITS}(?::${UNITS})?>`, "gi");

// Regex: <u:value_with_unit:targets> (pre-send conversion)
// Uses negative lookbehind to ignore escaped \<u
export const PRESEND_REGEX = new RegExp(`(?<!\\\\)<u:${VALUE}\\s*${UNITS}:${TARGET_UNITS}>`, "gi");

// Regex to match escaped pre-send syntax <!u:...> (will be displayed as plain text <u:...>)
export const ESCAPED_PRESEND_REGEX = new RegExp(`<!u:${VALUE}\\s*${UNITS}:${TARGET_UNITS}>`, "gi");

// Regex to match any <u...> pattern (including malformed ones) for exclusion from auto-detect
// Matches from <u until the next > to exclude the entire region
export const MALFORMED_U_REGEX = /<u[^>]*>/gi;

// Natural format regex: matches values like 32.2km, -12K, -12,423 °C, 5.5 kg
export const NATURAL_UNIT_REGEX = new RegExp(`(?<!/)${VALUE}\\s*${UNITS}\\b`, "gi");

// Regex to match emojis
export const UNICODE_EMOJI_RANGE_REGEX = "([\\u{1F000}-\\u{1F9FF}]|[\\u{2600}-\\u{27BF}])";

// Regex to match <u...> tags that contain emojis
export const EMOJI_IN_UNIT_TAG_REGEX = new RegExp(`<u[^>]*(?<!\\\\)${UNICODE_EMOJI_RANGE_REGEX}>`, "gu");



