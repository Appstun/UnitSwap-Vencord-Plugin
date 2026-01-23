## Adding a new unit conversion

1. Open [`types.ts`](./types.ts) and add a new type string to one of the unit types (for example to the `TemperatureUnit`)
2. In the same file, add to the respective `UnitConfig` object in the `UNIT_CONFIGS` units array your new unit string.
3. In the `converters` folder you should already see lint errors. Open the file with the error and add your conversion formula as a new case in `toXXXX` & `fromXXXX` functions. (The word after `to`/`from` is the conversion target unit/factor respectively)

## Adding a new physical quantity

1. Open [`types.ts`](./types.ts) and create a new type for your physical quantity (for example `LengthUnit`) and add it to the `MeasurementUnit` union type.
2. In the same file, add to the `UnitType` type your new type string (for example `"L"` for Length) and a new mapping in the `UnitsByType` interface.
3. Create a new TS-file in the `converters` folder (or copy an existing one) and implement the conversion functions `toXXXX` & `fromXXXX` as well as the `convertXXXX` & `formatXXXX` functions. You can use existing files as reference.
4. Add to the respective `UnitConfig` object in the `UNIT_CONFIGS` array in [`types.ts`](./types.ts) with your new type and units.
5. Open [`converters/_index.ts`](./converters/_index.ts), import your new converter functions, and add a new `case "X":` in the `convertUnit` function that handles your conversion.
6. Open [`settings.tsx`](./settings.tsx) and add a new line in the `settings` const object: `preferredXXX: generateUnitDropdown("X", "full_name_in_lower", defaultUnit)`. Update the `SettingsAboutComponent` to include your new unit type in the type list (and optionally the examples).

## Legend

- `XXXX`: Placeholder for physical quantity name (e.g. Temperature, Distance, Volume, Weight, Length)
- `XXX`: Setting option name (gets used in the settings UI as the title/label)
- `X`: Placeholder for `UnitType` string (one letter, upper case)
