/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { TemperatureUnit } from "../types";
import { formatValue } from "./_index";

// Convert everything to Celsius
function toC(val: number, from: TemperatureUnit): number {
    switch (from) {
        case "C": return val;
        case "F": return (val - 32) * 5 / 9;
        case "K": return val - 273.15;
    }
}

// Convert from Celsius to the target unit
function fromC(val: number, to: TemperatureUnit): number {
    switch (to) {
        case "C": return val;
        case "F": return val * 9 / 5 + 32;
        case "K": return val + 273.15;
    }
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
    const celsius = toC(value, from);
    return fromC(celsius, to);
}

export function formatTemperature(value: number, unit: TemperatureUnit, decimalPlaces: number = 2, autoTrim: boolean = true, maxDecimalPlaces: number = 6): string {
    const unitStr = unit === "K" ? "K" : `°${unit}`;
    return formatValue(value, unitStr, decimalPlaces, autoTrim, maxDecimalPlaces);
}
