/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { DistanceUnit } from "../types";
import { formatValue } from "./_index";

// Convert everything to meters (base unit)
function toMeter(val: number, from: DistanceUnit): number {
    switch (from) {
        case "m": return val;
        case "km": return val * 1000;
        case "mi": return val * 1609.344;
        case "ft": return val * 0.3048;
    }
}

// Convert from meters to the target unit
function fromMeter(val: number, to: DistanceUnit): number {
    switch (to) {
        case "m": return val;
        case "km": return val / 1000;
        case "mi": return val / 1609.344;
        case "ft": return val / 0.3048;
    }
}

export function convertDistance(value: number, from: DistanceUnit, to: DistanceUnit): number {
    const meters = toMeter(value, from);
    return fromMeter(meters, to);
}

export function formatDistance(value: number, unit: DistanceUnit, decimalPlaces: number = 2, autoTrim: boolean = true, maxDecimalPlaces: number = 6): string {
    return formatValue(value, unit, decimalPlaces, autoTrim, maxDecimalPlaces);
}
