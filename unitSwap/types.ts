/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ReactElement, ReactNode } from "react";

export type MeasurementUnit = TemperatureUnit | DistanceUnit | LengthUnit | WeightUnit | VolumeUnit;
export type TemperatureUnit = "C" | "F" | "K";
export type DistanceUnit = "km" | "mi" | "m" | "ft";
export type LengthUnit = "cm" | "mm" | "in" | "yd" | "🍎";
export type WeightUnit = "kg" | "lb" | "g" | "oz";
export type VolumeUnit = "L" | "gal" | "ml" | "floz";

export type UnitType = "T" | "D" | "L" | "W" | "V";

/** Maps UnitType to its corresponding unit type */
export type UnitsByType = {
    T: TemperatureUnit;
    D: DistanceUnit;
    L: LengthUnit;
    W: WeightUnit;
    V: VolumeUnit;
};

/** Creates union of {type, unit} pairs */
export type UnitMapping = { [K in UnitType]: { type: K; unit: UnitsByType[K]; } }[UnitType];

/** All valid unit key names (with or without ° prefix) */
export type UnitMappingNames = Lowercase<MeasurementUnit | `°${TemperatureUnit}`>;

/** Settings keys for preferred units */
export type PreferredUnitSettingKey = "preferredTemperature" | "preferredDistance" | "preferredLength" | "preferredWeight" | "preferredVolume";
export interface UnitConfig<T extends UnitType = UnitType> {
    type: T;
    units: readonly { label: string, value: UnitsByType[T]; }[];
    settingKey: PreferredUnitSettingKey;
}

/** Discord render node - can be string, ReactElement, or nested structure */
export type ContentNode = string | ReactElement | ContentNode[];

/** React element with accessible props for Discord's markdown rendering */
export interface DiscordElement {
    type: string | ((...args: unknown[]) => ReactNode) & { displayName?: string; name?: string; };
    props: {
        children?: ContentNode | ContentNode[];
        className?: string;
        [key: string]: unknown;
    };
    key?: string | null;
}

/** Match info for unit conversion */
export interface UnitMatchInfo {
    start: number;
    end: number;
    type: UnitType;
    fromUnit: MeasurementUnit;
    value: number;
    overrideUnit?: MeasurementUnit;
}

/** Range to exclude from natural unit detection */
export interface ExcludedRange {
    start: number;
    end: number;
}

/** Props passed to Tooltip children */
export interface TooltipChildProps {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    "aria-label"?: string;
}

/** Result of a unit conversion */
export interface ConversionResult {
    converted: string;
    original: string;
}

export const UNIT_CONFIGS: Record<UnitType, UnitConfig> = {
    T: {
        type: "T",
        units: [{ label: "Celsius", value: "C" }, { label: "Fahrenheit", value: "F" }, { label: "Kelvin", value: "K" }],
        settingKey: "preferredTemperature"
    },
    D: {
        type: "D",
        units: [{ label: "Kilometers", value: "km" }, { label: "Miles", value: "mi" }, { label: "Meters", value: "m" }, { label: "Feet", value: "ft" }],
        settingKey: "preferredDistance"
    },
    L: {
        type: "L",
        units: [{ label: "Centimeters", value: "cm" }, { label: "Millimeters", value: "mm" }, { label: "Inches", value: "in" }, { label: "Yards", value: "yd" }, { label: "🍎", value: "🍎" }],
        settingKey: "preferredLength"
    },
    W: {
        type: "W",
        units: [{ label: "Kilograms", value: "kg" }, { label: "Pounds", value: "lb" }, { label: "Grams", value: "g" }, { label: "Ounces", value: "oz" }],
        settingKey: "preferredWeight"
    },
    V: {
        type: "V",
        units: [{ label: "Liters", value: "L" }, { label: "Gallons", value: "gal" }, { label: "Milliliters", value: "ml" }, { label: "Fluid Ounces", value: "floz" }],
        settingKey: "preferredVolume"
    }
};
