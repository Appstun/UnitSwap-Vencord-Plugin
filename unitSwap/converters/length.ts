/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { LengthUnit } from "../types";
import { formatValue } from "./_index";

// Convert everything to centimeters (base unit)
function toCentimeter(val: number, from: LengthUnit): number {
    switch (from) {
        case "cm": return val;
        case "mm": return val / 10;
        case "in": return val * 2.54;
        case "yd": return val * 91.44;
        case "🍎": return val * 7.5;
    }
}

// Convert from centimeters to the target unit
function fromCentimeter(val: number, to: LengthUnit): number {
    switch (to) {
        case "cm": return val;
        case "mm": return val * 10;
        case "in": return val / 2.54;
        case "yd": return val / 91.44;
        case "🍎": return val / 7.5;
    }
}

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
    const centimeters = toCentimeter(value, from);
    return fromCentimeter(centimeters, to);
}

export function formatLength(value: number, unit: LengthUnit, decimalPlaces: number = 2, autoTrim: boolean = true, maxDecimalPlaces: number = 6): string {
    return formatValue(value, unit, decimalPlaces, autoTrim, maxDecimalPlaces);
}
