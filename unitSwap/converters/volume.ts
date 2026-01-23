/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { VolumeUnit } from "../types";
import { formatValue } from "./_index";

// Convert everything to milliliters (base unit)
function toMl(val: number, from: VolumeUnit): number {
    switch (from) {
        case "ml": return val;
        case "L": return val * 1000;
        case "gal": return val * 3785.41;
        case "floz": return val * 29.5735;
    }
}

// Convert from milliliters to the target unit
function fromMl(val: number, to: VolumeUnit): number {
    switch (to) {
        case "ml": return val;
        case "L": return val / 1000;
        case "gal": return val / 3785.41;
        case "floz": return val / 29.5735;
    }
}

export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
    const ml = toMl(value, from);
    return fromMl(ml, to);
}

export function formatVolume(value: number, unit: VolumeUnit, decimalPlaces: number = 2, autoTrim: boolean = true, maxDecimalPlaces: number = 6): string {
    return formatValue(value, unit, decimalPlaces, autoTrim, maxDecimalPlaces);
}
