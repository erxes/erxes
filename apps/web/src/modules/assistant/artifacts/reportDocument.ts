export type ColorScheme = 'light' | 'dark' | 'light dark';

const PALETTE = `
:root {
  --bg: light-dark(oklch(1 0 0), oklch(0.2044 0 0));
  --fg: light-dark(oklch(0.21 0.006 285.87), oklch(0.976 0.001 286.38));
  --muted: light-dark(oklch(0.52 0.006 17.33), oklch(0.713 0.004 17.26));
  --border: light-dark(oklch(0.92 0.004 286.32), oklch(0.28 0.01 285.76));
  --accent: light-dark(oklch(0.969 0.001 286.38), oklch(0.245 0.004 286.12));
  --primary: oklch(0.514 0.228 276.98);
  --link: light-dark(oklch(0.514 0.228 276.98), oklch(0.7 0.15 276.98));
  --up: light-dark(oklch(0.47 0.14 149.49), oklch(0.72 0.192 149.49));
  --down: light-dark(oklch(0.5 0.19 25.33), oklch(0.72 0.17 25.33));
}`;

const REPORT_CSS = `
* { box-sizing: border-box; }
html { font: 14px/1.5 Inter, ui-sans-serif, system-ui, sans-serif; color: var(--fg); background: var(--bg); }
body { margin: 0; padding: 16px; overflow-wrap: anywhere; }
h1 { font-size: 20px; margin: 0 0 4px; } h2 { font-size: 16px; margin: 24px 0 8px; } h3 { font-size: 14px; margin: 16px 0 6px; }
p { margin: 0 0 8px; } a { color: var(--link); }
.scope, small, figcaption, caption { color: var(--muted); font-size: 12px; }
.scope { margin-bottom: 16px; }
.up { color: var(--up); } .down { color: var(--down); }
.kpis { list-style: none; padding: 0; margin: 0 0 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
.kpi { border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.kpi span { color: var(--muted); font-size: 12px; } .kpi strong { font-size: 20px; font-variant-numeric: tabular-nums; }
.bars { list-style: none; padding: 0; margin: 0 0 16px; display: grid; grid-template-columns: minmax(80px, max-content) 1fr max-content; gap: 6px 10px; align-items: center; }
.bars li { display: contents; } .bars li > span:last-child { text-align: right; font-variant-numeric: tabular-nums; }
.bar { display: block; height: 10px; min-width: 2px; border-radius: 3px; background: var(--primary); }
.bar.baseline { background: var(--muted); } .bar.up { background: var(--up); } .bar.down { background: var(--down); }
.legend { list-style: none; padding: 0; margin: 0 0 8px; display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: var(--muted); }
.legend li { display: flex; align-items: center; gap: 6px; } .legend .bar { width: 16px; }
figure { margin: 0 0 20px; } figure svg { display: block; width: 100%; height: auto; }
svg text { fill: var(--muted); font-size: 11px; }
.mark { fill: var(--primary); } .mark.baseline { fill: var(--muted); } .mark.up { fill: var(--up); } .mark.down { fill: var(--down); }
.line { fill: none; stroke: var(--primary); stroke-width: 2; } .axis { stroke: var(--border); } .gridline { stroke: var(--border); stroke-dasharray: 2 3; }
table { width: 100%; border-collapse: collapse; margin: 0 0 20px; font-size: 13px; }
caption { text-align: left; padding-bottom: 6px; }
th, td { padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
th { font-weight: 600; color: var(--muted); font-size: 12px; } td { font-variant-numeric: tabular-nums; }
tr.highlight td { background: var(--accent); }
ul, ol { padding-left: 20px; } pre, code { font-family: ui-monospace, monospace; font-size: 12px; }
blockquote { margin: 0 0 8px; padding-left: 12px; border-left: 3px solid var(--border); color: var(--muted); }
@media print { :root { color-scheme: light; } body { padding: 0; } }`;

const POLICY = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";

export const HEIGHT_MESSAGE = 'erxesReportHeight';

const SIZER = `new ResizeObserver(() => parent.postMessage({ ${HEIGHT_MESSAGE}: document.documentElement.scrollHeight }, '*')).observe(document.documentElement);`;

export const escapeHtml = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const reportDocument = (
  title: string,
  body: string,
  scheme: ColorScheme,
  sizerNonce?: string,
) =>
  [
    '<!doctype html>',
    `<html lang="${escapeHtml(document.documentElement.lang || 'en')}">`,
    '<head><meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${POLICY}${sizerNonce ? `; script-src 'nonce-${sizerNonce}'` : ''}">`,
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<base target="_blank">',
    `<title>${escapeHtml(title)}</title>`,
    `<style>:root { color-scheme: ${scheme}; }${PALETTE}${REPORT_CSS}</style>`,
    ...(sizerNonce ? [`<script nonce="${sizerNonce}">${SIZER}</script>`] : []),
    '</head>',
    `<body>${body}</body>`,
    '</html>',
  ].join('\n');
