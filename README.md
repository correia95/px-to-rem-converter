# PX to REM Converter

Convert a CSS length between **px**, **rem**, **em**, **pt** and **%** against a base
(root) font size.

- Enter a value in any unit; all five are shown, each a click-to-copy chip.
- Base font size is configurable (browser default is 16px). An optional advanced field
  sets a different parent font size for `em` / `%`.
- Live **px → rem** reference table for common pixel sizes.
- State kept in the URL (`?v=&u=&b=&e=`) so a conversion is shareable.
- No sign-up, no network calls — arithmetic in the browser, works offline once loaded.

## Develop

```
npm install
npm run dev
npm run build
```

Conversion: [`src/convert.ts`](src/convert.ts). Static site on Cloudflare Workers.

Part of [Tiny Tools](https://tinytools.correia95.workers.dev).
