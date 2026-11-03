# JetBrains Themes for Orca

Color themes for [Orca](https://github.com/stablyai/orca) taken from the JetBrains IDEs
(IntelliJ Platform 2025.3): app colors, editor syntax colors and terminal palettes.

| App theme | Base | Based on |
| --- | --- | --- |
| JetBrains Islands Dark | dark | Islands Dark (2025.3 default) + Islands Dark editor scheme |
| JetBrains Dark | dark | New UI "Dark" + Dark editor scheme |
| JetBrains Islands Light | light | Islands Light + Light editor scheme |

Terminal themes: **JetBrains Islands Dark**, **JetBrains Dark** and **JetBrains Light**, from
each scheme's console ANSI colors.

## Install

- From the catalog: search for "JetBrains Themes" in Orca's plugin browser.
- From a checkout: `orca plugin dev load <path-to-this-folder>`.

Then pick the themes in **Settings → Appearance** (app, editor and terminal themes are chosen
separately).

## Notes

- Primary buttons use JetBrains' `#366ACE` instead of `#3574F0`, because white text on
  `#3574F0` is below Orca's 4.5:1 contrast minimum and Orca would drop it.
- Orca paints the editor's current line with `--accent`, so `--accent` is JetBrains' hover
  color rather than its blue selection color (which would make every caret line a blue band).
  Selected sidebar rows still use the JetBrains selection blue.
- Orca's built-in languages use Monaco token names (`comment.doc`, `type.identifier`, …), so
  `tokenColors` includes those alongside the TextMate scopes.
- JetBrains colors code semantically (e.g. method calls vs. declarations); Orca uses TextMate
  scopes, so a few distinctions are approximated.

## Development

Colors live in `tools/build.mjs`. Edit there, then regenerate and validate:

```sh
node tools/build.mjs
orca plugin validate .
```

Not affiliated with or endorsed by JetBrains. JetBrains, IntelliJ and related names are
trademarks of JetBrains s.r.o.
