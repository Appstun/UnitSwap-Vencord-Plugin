/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType, PluginSettingCommon, PluginSettingSelectDef, PluginSettingSelectOption } from "@utils/types";
import { Forms } from "@webpack/common";

import { UNIT_CONFIGS, UnitsByType } from "./types";

function generateUnitDropdown<T extends keyof typeof UNIT_CONFIGS>(type: T, conversionName: string, defaultUnit?: UnitsByType[T]): PluginSettingCommon & PluginSettingSelectDef {
    const options: PluginSettingSelectOption[] = [];

    for (const unit of UNIT_CONFIGS[type].units) {
        options.push({ label: unit.label !== unit.value ? `${unit.label} (${unit.value})` : unit.label, value: unit.value, default: unit.value === defaultUnit || undefined });
    }

    if (options.length > 0 && !options.some(opt => opt.default)) {
        options[0].default = true;
    }

    return {
        type: OptionType.SELECT as const,
        description: `[${type}] Target unit for ${conversionName} conversions`,
        options
    };
}

export const settings = definePluginSettings({
    autoDetect: {
        type: OptionType.BOOLEAN,
        description: "Auto-detect units without special syntax (e.g. 32.2km, -12°C)",
        default: true
    },
    decimalPlaces: {
        type: OptionType.SLIDER,
        description: "Number of decimal places to display (minimum when auto is enabled)",
        default: 2,
        markers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        stickToMarkers: true,
        onChange: (value: number) => {
            //! Does not work consistently
            if (value > settings.plain.maxDecimalPlaces) {
                settings.plain.maxDecimalPlaces = value;
            }
        }
    },
    autoDecimalPlaces: {
        type: OptionType.BOOLEAN,
        description: "Automatically adjust decimal places for small values and trim trailing zeros",
        default: false,
    },
    maxDecimalPlaces: {
        type: OptionType.SLIDER,
        description: "Maximum decimal places when auto is enabled (for small values like 0.0005)",
        default: 6,
        markers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        stickToMarkers: true,
        disabled: () => !settings.store.autoDecimalPlaces,
        isValid: (value: number) => value >= settings.store.decimalPlaces || "Must be greater or equal to Decimal Places",
        onChange: (value: number) => {
            if (value < settings.plain.decimalPlaces) {
                //! Does Only sets it when maxDecimalPlaces is
                //! higher than decimalPlaces when started to drag slider
                //! equal or less doesn't work
                settings.plain.maxDecimalPlaces = settings.plain.decimalPlaces;
                settings.store.maxDecimalPlaces = settings.plain.decimalPlaces;
            }
        }
    },
    preferredTemperature: generateUnitDropdown("T", "temperature", "C"),
    preferredDistance: generateUnitDropdown("D", "distance", "km"),
    preferredLength: generateUnitDropdown("L", "length", "cm"),
    preferredWeight: generateUnitDropdown("W", "weight", "kg"),
    preferredVolume: generateUnitDropdown("V", "volume", "L"),
});

export function SettingsAboutComponent() {
    // Ensure maxDecimalPlaces is in the correct range
    // because onChange is not reliable
    if (settings.store.maxDecimalPlaces < settings.store.decimalPlaces) {
        settings.store.maxDecimalPlaces = settings.store.decimalPlaces;
    }
    if (settings.store.decimalPlaces > settings.plain.maxDecimalPlaces) {
        settings.plain.maxDecimalPlaces = settings.store.decimalPlaces;
    }

    return (
        <>
            <Forms.FormTitle tag="h3">Client-Side Conversion (Plugin Users Only)</Forms.FormTitle>
            <Forms.FormText>
                Use the syntax <code>&lt;uX:value_with_unit&gt;</code> where X is the unit type:
            </Forms.FormText>
            <Forms.FormText>
                <ul>
                    <li><code>T</code> = Temperature (°C, °F, K)</li>
                    <li><code>D</code> = Distance (km, mi, m, ft)</li>
                    <li><code>L</code> = Length (cm, mm, in, yd)</li>
                    <li><code>W</code> = Weight (kg, lb, g, oz)</li>
                    <li><code>V</code> = Volume (L, gal, ml)</li>
                </ul>
            </Forms.FormText>
            <Forms.FormText>
                Examples:
                <ul>
                    <li><code>&lt;uT:25°C&gt;</code> → Converts to your preferred temperature</li>
                    <li><code>&lt;uD:100km&gt;</code> → Converts to your preferred distance</li>
                    <li><code>&lt;uW:5kg&gt;</code> → Converts to your preferred weight</li>
                    <li><code>&lt;uV:2L&gt;</code> → Converts to your preferred volume</li>
                </ul>
            </Forms.FormText>

            <Forms.FormTitle tag="h3" style={{ marginTop: "16px" }}>Unit Override (Force Display Unit)</Forms.FormTitle>
            <Forms.FormText>
                Use <code>&lt;uX:value:unit&gt;</code> to force display in a specific unit. The tooltip will show your preferred unit.
            </Forms.FormText>
            <Forms.FormText>
                Examples:
                <ul>
                    <li><code>&lt;uT:25°C:K&gt;</code> → Shows 298.15K (tooltip shows your preferred unit)</li>
                    <li><code>&lt;uD:100km:mi&gt;</code> → Shows 62.14mi (tooltip shows your preferred unit)</li>
                    <li><code>&lt;uW:5kg:lb&gt;</code> → Shows 11.02lb (tooltip shows your preferred unit)</li>
                    <li><code>&lt;uV:2L:gal&gt;</code> → Shows 0.53gal (tooltip shows your preferred unit)</li>
                </ul>
            </Forms.FormText>

            <Forms.FormTitle tag="h3" style={{ marginTop: "16px" }}>Pre-Send Conversion (Visible to Everyone)</Forms.FormTitle>
            <Forms.FormText>
                Use the syntax <code>&lt;u:value_with_unit:target1,target2,...&gt;</code> to embed conversions directly in your message.
                This is visible to everyone, even without the plugin!
            </Forms.FormText>
            <Forms.FormText>
                Examples:
                <ul>
                    <li><code>&lt;u:14km:mi,m&gt;</code> → 14km (8.7mi & 14000m)</li>
                    <li><code>&lt;u:25°C:F,K&gt;</code> → 25°C (77°F & 298.15K)</li>
                    <li><code>&lt;u:5kg:lb,oz&gt;</code> → 5kg (11.02lb & 176.37oz)</li>
                </ul>
            </Forms.FormText>

            <Forms.FormTitle tag="h3" style={{ marginTop: "16px" }}>Auto-Detect Mode</Forms.FormTitle>
            <Forms.FormText>
                When enabled, the plugin will automatically detect and convert units written naturally (e.g. <code>32.2km</code>, <code>-12°C</code>).
                Units matching your preferred setting will not be converted.
            </Forms.FormText>
        </>
    );
}
