/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { WeightUnit } from "../types";
import { formatValue } from "./_index";

// Convert everything to grams (base unit)
function toGram(val: number, from: WeightUnit): number {
    switch (from) {
        case "g": return val;
        case "kg": return val * 1000;
        case "lb": return val * 453.592;
        case "oz": return val * 28.3495;
    }
}

// Convert from grams to the target unit
function fromGram(val: number, to: WeightUnit): number {
    switch (to) {
        case "g": return val;
        case "kg": return val / 1000;
        case "lb": return val / 453.592;
        case "oz": return val / 28.3495;
    }
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
    const grams = toGram(value, from);
    return fromGram(grams, to);
}

export function formatWeight(value: number, unit: WeightUnit, decimalPlaces: number = 2, autoTrim: boolean = true, maxDecimalPlaces: number = 6): string {
    return formatValue(value, unit, decimalPlaces, autoTrim, maxDecimalPlaces);
}
