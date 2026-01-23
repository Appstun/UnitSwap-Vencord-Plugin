/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ConversionResult, DistanceUnit, LengthUnit, TemperatureUnit, UnitsByType, UnitType, VolumeUnit, WeightUnit } from "../types";
import { convertDistance, formatDistance } from "./distance";
import { convertLength, formatLength } from "./length";
import { convertTemperature, formatTemperature } from "./temperature";
import { convertVolume, formatVolume } from "./volume";
import { convertWeight, formatWeight } from "./weight";

export function formatValue(
    value: number,
    unitStr: string,
    decimalPlaces: number = 2,
    autoTrim: boolean = true,
    maxDecimalPlaces: number = 6,
): string {
    const effectiveMax = Math.max(maxDecimalPlaces, decimalPlaces);
    const precision = autoTrim ? effectiveMax : decimalPlaces;
    let formatted = value.toFixed(precision);
    if (autoTrim) {
        formatted = formatted.replace(/\.?0+$/, "");
    }
    formatted = formatted.replace(".", ",");
    return `${formatted}${unitStr}`;
}

export function convertUnit<T extends UnitType = UnitType>(
    type: T,
    value: number,
    fromUnit: UnitsByType[T],
    toUnit: UnitsByType[T],
    decimalPlaces: number = 2,
    autoTrim: boolean = true,
    maxDecimalPlaces: number = 6
): ConversionResult {
    let convertedValue: number;
    let convertedStr: string;
    let originalStr: string;

    switch (type) {
        case "T":
            convertedValue = convertTemperature(value, fromUnit as TemperatureUnit, toUnit as TemperatureUnit);
            convertedStr = formatTemperature(convertedValue, toUnit as TemperatureUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            originalStr = formatTemperature(value, fromUnit as TemperatureUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            break;
        case "D":
            convertedValue = convertDistance(value, fromUnit as DistanceUnit, toUnit as DistanceUnit);
            convertedStr = formatDistance(convertedValue, toUnit as DistanceUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            originalStr = formatDistance(value, fromUnit as DistanceUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            break;
        case "L":
            convertedValue = convertLength(value, fromUnit as LengthUnit, toUnit as LengthUnit);
            convertedStr = formatLength(convertedValue, toUnit as LengthUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            originalStr = formatLength(value, fromUnit as LengthUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            break;
        case "W":
            convertedValue = convertWeight(value, fromUnit as WeightUnit, toUnit as WeightUnit);
            convertedStr = formatWeight(convertedValue, toUnit as WeightUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            originalStr = formatWeight(value, fromUnit as WeightUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            break;
        case "V":
            convertedValue = convertVolume(value, fromUnit as VolumeUnit, toUnit as VolumeUnit);
            convertedStr = formatVolume(convertedValue, toUnit as VolumeUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            originalStr = formatVolume(value, fromUnit as VolumeUnit, decimalPlaces, autoTrim, maxDecimalPlaces);
            break;
    }

    return { converted: convertedStr, original: originalStr };
}
