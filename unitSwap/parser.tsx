/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByPropsLazy } from "@webpack";
import { Tooltip } from "@webpack/common";
import type { ReactElement, ReactNode } from "react";

import { logger } from ".";
import { ESCAPED_PRESEND_REGEX, ESCAPED_UNIT_REGEX, MALFORMED_U_REGEX, NATURAL_UNIT_MAP, NATURAL_UNIT_REGEX, PRESEND_REGEX, PROCESSED_MARKER, UNIT_REGEX } from "./constants";
import { convertUnit } from "./converters/_index";
import { settings } from "./settings";
import { ContentNode, DiscordElement, ExcludedRange, MeasurementUnit, TooltipChildProps, UNIT_CONFIGS, UnitMatchInfo, UnitsByType, UnitType } from "./types";

const TimestampClasses = findByPropsLazy("timestamp", "blockquoteContainer");

// Cache for converted values to avoid redundant calculations
const conversionCache = new Map<string, { converted: string; original: string; }>();
const MAX_CACHE_SIZE = 500;

/** Safe Tooltip wrapper component that handles cases where Tooltip might not be ready */
function UnitTooltip({ text, children, fallbackTitle }: {
    text: ReactNode;
    children: string;
    fallbackTitle: string;
}) {
    try {
        return (
            <Tooltip text={text}>
                {(tooltipProps: TooltipChildProps) => (
                    <span
                        {...tooltipProps}
                        className={TimestampClasses?.timestamp}
                    >
                        {children}
                    </span>
                )}
            </Tooltip>
        );
    } catch {
        logger.warn("Tooltip component not ready, using fallback.");
        return (
            <span
                className={TimestampClasses?.timestamp}
                title={fallbackTitle}
            >
                {children}
            </span>
        );
    }
}

function getCachedConversion<T extends UnitType = UnitType>(
    type: T,
    value: number,
    fromUnit: UnitsByType[T],
    toUnit: UnitsByType[T],
    decimalPlaces: number,
    autoTrim: boolean,
    maxDecimalPlaces: number
): { converted: string; original: string; } {
    const cacheKey = `${type}:${value}:${fromUnit}:${toUnit}:${decimalPlaces}:${autoTrim}:${maxDecimalPlaces}`;

    const cached = conversionCache.get(cacheKey);
    if (cached) return cached;

    const result = convertUnit(type, value, fromUnit, toUnit, decimalPlaces, autoTrim, maxDecimalPlaces);

    // Evict oldest entries if cache is full
    if (conversionCache.size >= MAX_CACHE_SIZE) {
        const firstKey = conversionCache.keys().next().value;
        if (firstKey) conversionCache.delete(firstKey);
    }

    conversionCache.set(cacheKey, result);
    return result;
}

/** Type guard to check if node is a Discord element with props */
export function isDiscordElement(node: unknown): node is DiscordElement {
    return (
        node !== null &&
        typeof node === "object" &&
        "type" in node &&
        "props" in node
    );
}

/** Check if a node is a code element that should be skipped */
function isCodeElement(node: DiscordElement): boolean {
    const nodeType = typeof node.type === "string" ? node.type : node.type?.name || "";
    const typeName = (typeof node.type === "function" ? (node.type.displayName || node.type.name) : nodeType) || "";

    return (
        typeName === "inlineCode" ||
        typeName === "codeBlock" ||
        typeName === "code" ||
        (typeof node.type === "function" && !!(node.type.displayName?.toLowerCase?.().includes("code") || node.type.name?.toLowerCase?.().includes("code"))) ||
        nodeType === "code" ||
        !!node.props.className?.includes?.("inlineCode") ||
        !!node.props.className?.includes?.("codeBlock") ||
        !!node.props.className?.includes?.("code")
    );
}

/** Process an array of content nodes recursively */
export function processNodes(nodes: ContentNode[]): ContentNode[] {
    const result: ContentNode[] = [];

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (typeof node === "string") {
            const processed = processString(node, i);
            result.push(...processed);
        } else if (isDiscordElement(node)) {
            if (isCodeElement(node)) {
                result.push(node as ReactElement);
                continue;
            }
            if (node.props.children) {
                const newNode = { ...node } as DiscordElement;
                const children = Array.isArray(node.props.children)
                    ? node.props.children
                    : [node.props.children];
                newNode.props = { ...node.props, children: processNodes(children as ContentNode[]) };
                result.push(newNode as ReactElement);
            } else {
                result.push(node as ReactElement);
            }
        } else if (Array.isArray(node)) {
            result.push(...processNodes(node));
        } else if (node != null) {
            result.push(node);
        }
    }

    return result;
}

/** Process a string and convert any unit matches to React elements */
export function processString(text: string, idx: number): ContentNode[] {
    // Skip already processed text (contains zero-width space marker from pre-send)
    if (text.includes(PROCESSED_MARKER)) return [text];

    // Handle escaped syntax: <!uX:...> → temporarily replace with marker
    const escapedMatches: string[] = [];

    text = text.replace(ESCAPED_UNIT_REGEX, (_, type, value, unit, override) => {
        const index = escapedMatches.length;
        const overridePart = override ? `:${override}` : "";
        escapedMatches.push(`<u${type}:${value}${unit}${overridePart}>`);
        return `\u200DESCAPED_UNIT_${index}\u200D`;
    });
    text = text.replace(ESCAPED_PRESEND_REGEX, (_, value, unit, targets) => {
        const index = escapedMatches.length;
        escapedMatches.push(`<u:${value}${unit}:${targets}>`);
        return `\u200DESCAPED_UNIT_${index}\u200D`;
    });

    const useAutoDetect = settings.store.autoDetect;
    const parts: ContentNode[] = [];
    let lastIndex = 0;
    const allMatches: UnitMatchInfo[] = [];

    // Match special syntax <uX:value_with_unit> or <uX:value_with_unit:override>
    UNIT_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = UNIT_REGEX.exec(text)) !== null) {
        const typeChar = match[1].toUpperCase();
        const valueStr = match[2];
        const rawUnit = match[3].toLowerCase();
        const rawOverrideUnit = match[4]?.toLowerCase();
        const type = typeChar as UnitType;

        const mapping = NATURAL_UNIT_MAP[rawUnit];
        if (!mapping) continue;
        const fromUnit = mapping.unit;

        if (!UNIT_CONFIGS[type] || mapping.type !== type) continue;

        let overrideUnit: MeasurementUnit | undefined;
        if (rawOverrideUnit) {
            const overrideMapping = NATURAL_UNIT_MAP[rawOverrideUnit];
            if (overrideMapping && overrideMapping.type === type) {
                overrideUnit = overrideMapping.unit;
            }
        }

        const value = parseFloat(valueStr.replace(",", "."));
        if (isNaN(value)) continue;

        allMatches.push({
            start: match.index,
            end: UNIT_REGEX.lastIndex,
            type,
            fromUnit,
            value,
            overrideUnit
        });
    }

    // Auto-detect natural format
    if (useAutoDetect) {
        const excludedRanges: ExcludedRange[] = allMatches.map(m => ({ start: m.start, end: m.end }));

        PRESEND_REGEX.lastIndex = 0;
        let excludeMatch: RegExpExecArray | null;
        while ((excludeMatch = PRESEND_REGEX.exec(text)) !== null) {
            excludedRanges.push({ start: excludeMatch.index, end: PRESEND_REGEX.lastIndex });
        }

        MALFORMED_U_REGEX.lastIndex = 0;
        while ((excludeMatch = MALFORMED_U_REGEX.exec(text)) !== null) {
            excludedRanges.push({ start: excludeMatch.index, end: MALFORMED_U_REGEX.lastIndex });
        }

        NATURAL_UNIT_REGEX.lastIndex = 0;
        while ((match = NATURAL_UNIT_REGEX.exec(text)) !== null) {
            const valueStr = match[1];
            const rawUnit = match[2].toLowerCase();
            const mapping = NATURAL_UNIT_MAP[rawUnit];
            if (!mapping) continue;

            const { type, unit: fromUnit } = mapping;
            const start = match.index;
            const end = NATURAL_UNIT_REGEX.lastIndex;
            const insideExcluded = excludedRanges.some(r => start >= r.start && end <= r.end);
            if (insideExcluded) continue;

            const overlaps = allMatches.some(m =>
                (start >= m.start && start < m.end) || (end > m.start && end <= m.end)
            );
            if (overlaps) continue;

            const value = parseFloat(valueStr.replace(",", "."));
            if (isNaN(value)) continue;

            allMatches.push({ start, end, type, fromUnit, value });
        }
    }

    // Helper to restore escaped units
    const restoreEscaped = (str: string): string => {
        return str.replace(/\u200DESCAPED_UNIT_(\d+)\u200D/g, (_, index) => {
            return escapedMatches[parseInt(index, 10)] || "";
        });
    };

    if (allMatches.length === 0) {
        return [restoreEscaped(text)];
    }

    allMatches.sort((a, b) => a.start - b.start);

    const decimalPlaces = settings.store.decimalPlaces ?? 2;
    const autoTrim = settings.store.autoDecimalPlaces ?? true;
    const maxDecimalPlaces = settings.store.maxDecimalPlaces ?? 6;

    for (const m of allMatches) {
        if (m.start > lastIndex) {
            parts.push(text.slice(lastIndex, m.start));
        }

        const config = UNIT_CONFIGS[m.type];
        const userPreferredUnit = (settings.store[config.settingKey] ?? config.units[0]) as MeasurementUnit;
        const displayUnit = m.overrideUnit ?? userPreferredUnit;

        const { converted } = getCachedConversion(m.type, m.value, m.fromUnit, displayUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
        const { converted: originalValue } = getCachedConversion(m.type, m.value, m.fromUnit, m.fromUnit, decimalPlaces, autoTrim, maxDecimalPlaces);

        const tooltipContent = m.overrideUnit && m.overrideUnit !== userPreferredUnit
            ? (
                <>
                    <span style={{ fontWeight: "bold", fontSize: "11px", display: "block", textAlign: "center", marginTop: "-6px" }}>Override</span>
                    Original: {originalValue}
                    <br />
                    Preferred: {getCachedConversion(m.type, m.value, m.fromUnit, userPreferredUnit, decimalPlaces, autoTrim, maxDecimalPlaces).converted}
                </>
            )
            : `Original: ${originalValue}`;

        parts.push(
            <UnitTooltip
                key={`unit-${idx}-${m.start}`}
                text={tooltipContent}
                fallbackTitle={`Original: ${originalValue}`}
            >
                {converted}
            </UnitTooltip>
        );

        lastIndex = m.end;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    const result: ContentNode[] = parts.map((item): ContentNode => {
        if (typeof item === "string") {
            return restoreEscaped(item);
        }
        return item;
    });

    return result.length > 0 ? result : [restoreEscaped(text)];
}
