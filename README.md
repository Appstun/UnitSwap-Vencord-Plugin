# UnitSwap Plugin for Vencord

Converts units inline directly in Discord messages. Supports temperature, distance, weight, length and volume conversions.

This plugin is just a curiosity project of mine and I heavily used Claude Opus to generate the logical parts of the code.

## Features

- **Client-side conversion**: Use `<uD:16km>` syntax to convert units only for yourself & other plugin users
- **Unit override**: Use `<uT:25°C:K>` to force display in a specific unit (tooltip shows your preferred unit)
- **Pre-send conversion**: Use `<u:16km:mi,m>` to convert and send the result visible to everyone
- **Auto-detect mode**: Optionally detect units automatically without special syntax (e.g. `32.2km`, `-12°C`)


# Installation

> [!CAUTION]
> Installing custom/unofficial Vencord plugins can be dangerous. Only install plugins from sources you trust and understand the risks involved.<br>
> **If you don’t understand** the following instructions, you should not attempt to install custom plugins.

Unofficial Vencord plugins cannot be installed in a pre-built Vencord setup. You need to build Vencord from source to use this plugin.

1. Follow the official [Vencord setup guide](https://docs.vencord.dev/installing/custom-plugins/) to set up a development environment and install custom plugins.
2. After that copy the `unitSwap` folder of this repository into the `src/userplugins/` directory. (If userplugins folder does not exist, create it).
3. To install Vencord to Discord, run `pnpm run build` and then `pnpm run inject` in the main Vencord directory. Follow the instructions in the terminal to complete the injection.
4. Start Discord and enable the UnitSwap plugin in Vencord settings.

> [!NOTE]
> After you have installed the custom Vencord build, you need to manually update Vencord in the future. To do so, pull the latest changes from the Vencord repository, rebuild, and re-inject.


# Some other things

## Future plans

I want to add this plugin to the official Vencord plugin repository, but I'm not really sure. The Vencord team does not currently accept new plugins. (See [plugin-request repo](https://github.com/Vencord/plugin-requests))

If you have some issues or suggestions, feel free to open an issue or a pull request.
