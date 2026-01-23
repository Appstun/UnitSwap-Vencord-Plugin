# UnitSwap

Converts units inline directly in Discord messages. Supports temperature, distance, weight, and volume conversions.

## Features

- **Client-side conversion**: Use `<uD:16km>` syntax to convert units only for yourself & other plugin users
- **Unit override**: Use `<uT:25°C:K>` to force display in a specific unit (tooltip shows your preferred unit)
- **Pre-send conversion**: Use `<u:16km:mi,m>` to convert and send the result visible to everyone
- **Auto-detect mode**: Optionally detect units automatically without special syntax (e.g. `32.2km`, `-12°C`)
- **Escape syntax**: Use `\<u` (pre-send) or `<!u` (rendered view) to prevent conversion

## Syntax

| Mode          | Syntax              | Example         | Result                                        |
| ------------- | ------------------- | --------------- | --------------------------------------------- |
| Client-only   | `<uX:value>`        | `<uD:16km>`     | Shows converted value, tooltip shows original |
| With override | `<uX:value:unit>`   | `<uT:25°C:K>`   | Shows in K (298,15K), tooltip shows your pref |
| Pre-send      | `<u:value:targets>` | `<u:16km:mi,m>` | Sends: `16km (9,94 mi & 16000 m)`             |
| Escape        | `<!uX:value>`       | `<!uD:16km>`    | Shows `<uD:16km>` without conversion          |

**Type prefixes:**

- `T` - Temperature (°C, °F, K)
- `D` - Distance (km, mi, m, ft)
- `W` - Weight (kg, lb, g, oz)
- `V` - Volume (L, gal, ml)

## Escaping

To show the syntax without conversion:

- **Pre-send**: Use backslash `\<u:16km:mi>` - won't be converted when sending
- **Rendered view**: Use `<!uD:16km>` - displays as `<uD:16km>` without conversion
- **Code blocks**: Wrap in backticks `` `<uD:16km>` `` - not processed

## Examples

```
<uT:32°C>           → Shows in your preferred unit, hover for original (32°C)
<uT:32°C:K>         → Always shows in Kelvin (305,15K), hover for your preferred unit
<uD:100mi>          → Shows converted to your preferred distance unit
<u:20°C:F>          → Sends: 20°C (68°F)
<u:5kg:lb,oz>       → Sends: 5kg (11,02 lb & 176,37 oz)
<u:10km:mi,m,ft>    → Sends: 10km (6,21 mi, 10000 m & 32808,4 ft)
<!uD:16km>          → Shows: <uD:16km> (no conversion)
```

## Settings

- **Auto-detect**: Enable to convert units without special syntax
- **Decimal Places**: Number of decimal places to display (minimum when auto is enabled)
- **Auto Decimal Places**: Automatically adjust decimal places for small values (e.g. 0,0005) and trim trailing zeros (e.g. 5,00 → 5)
- **Max Decimal Places**: Maximum decimal places when auto is enabled (only adjustable when Auto Decimal Places is active)
- **Preferred Temperature**: Choose between Celsius, Fahrenheit, or Kelvin
- **Preferred Distance**: Choose between km, miles, meters, or feet
- **Preferred Weight**: Choose between kg, pounds, grams, or ounces
- **Preferred Volume**: Choose between liters, gallons, or milliliters

## Create new Units

To add new units you need to modify the source code of the plugin. Use [Units.md](./Units.md) as a guide on how to add new units and conversions.
