import DOMPurify from 'dompurify';

const CSP_DIRECTIVES =
  "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; base-uri 'none'; form-action 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'";

/** Renderer-owned; `data-agent-renderer` is unreachable for sanitized model markup. */
const BASE_STYLES = `
:root { color-scheme: light dark; --background:#fff; --foreground:#242424; --muted:#f4f4f5; --muted-foreground:#71717a; --border:#e4e4e7; --primary:#635bdf; --primary-foreground:#fff; --success:#16a34a; --destructive:#dc2626; }
@media (prefers-color-scheme:dark) { :root { --background:#1b1b1b; --foreground:#f5f5f5; --muted:#27272a; --muted-foreground:#a1a1aa; --border:#3f3f46; } }
* { box-sizing:border-box; }
html { overflow-x:auto; }
body { display:flow-root; margin:0; padding:0; background:transparent; color:var(--foreground); font:14px/1.65 system-ui,sans-serif; overflow-wrap:anywhere; }
body > :first-child { margin-top:0; } body > :last-child { margin-bottom:0; }
p,ul,ol,blockquote,pre,table,figure { margin:0 0 12px; }
ul,ol { padding-left:20px; } li { margin:2px 0; } li::marker { color:var(--muted-foreground); }
h1,h2,h3,h4 { line-height:1.3; margin:24px 0 8px; font-weight:600; letter-spacing:-0.01em; text-wrap:balance; }
h1 { font-size:22px; } h2 { font-size:18px; } h3 { font-size:15px; }
h4 { font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:var(--muted-foreground); }
strong,b { font-weight:600; } small { color:var(--muted-foreground); }
a { color:var(--primary); } img,svg,video { max-width:100%; }
figcaption,caption { color:var(--muted-foreground); font-size:12px; }
figcaption { margin-top:6px; } caption { caption-side:top; padding-bottom:6px; text-align:left; }
table { border-collapse:collapse; width:100%; font-size:13px; font-variant-numeric:tabular-nums; }
th,td { padding:8px 12px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
th:first-child,td:first-child { padding-left:0; } th:last-child,td:last-child { padding-right:0; }
th { font-weight:600; }
thead th { color:var(--muted-foreground); font-size:11px; letter-spacing:0.04em; text-transform:uppercase; white-space:nowrap; vertical-align:bottom; }
tbody tr:last-child > * { border-bottom:0; }
tbody tr:hover > * { background:color-mix(in oklab,var(--muted) 55%,transparent); }
.agent-num { text-align:right; white-space:nowrap; }
pre { padding:12px; overflow:auto; background:var(--muted); border-radius:8px; white-space:pre-wrap; }
code { font:0.9em ui-monospace,monospace; } blockquote { margin-left:0; padding-left:16px; border-left:2px solid var(--border); color:var(--muted-foreground); }
hr { border:0; border-top:1px solid var(--border); margin:20px 0; }
.scope { margin:-4px 0 16px; color:var(--muted-foreground); font-size:12px; }
.up { color:color-mix(in oklab,var(--success) 70%,var(--foreground)); } .down { color:color-mix(in oklab,var(--destructive) 72%,var(--foreground)); }
.kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:8px; margin:0 0 16px; padding:0; list-style:none; }
.kpi { display:flex; flex-direction:column; gap:2px; min-width:0; margin:0; padding:10px 12px; border:1px solid var(--border); border-radius:10px; }
.kpi > :first-child { color:var(--muted-foreground); font-size:12px; font-weight:500; }
.kpi strong { font-size:20px; font-weight:600; line-height:1.25; letter-spacing:-0.02em; font-variant-numeric:tabular-nums; }
.kpi small { font-size:11.5px; font-variant-numeric:tabular-nums; } .kpi small.up,.kpi small.down { font-weight:600; }
.bars { display:grid; gap:8px; margin:0 0 12px; padding:0; list-style:none; font-size:13px; }
.bars li { display:grid; grid-template-columns:minmax(4.5rem,32%) minmax(0,1fr) minmax(4.5rem,auto); align-items:center; gap:4px 10px; margin:0; }
.bars li > :last-child { font-variant-numeric:tabular-nums; text-align:right; white-space:nowrap; }
.bar { display:block; max-width:100%; min-width:2px; height:12px; border-radius:4px; background:var(--primary); }
.bar.baseline { background:color-mix(in oklab,var(--muted-foreground) 30%,transparent); box-shadow:inset 0 0 0 1px var(--muted-foreground); }
.bar.up { background:var(--success); } .bar.down { background:var(--destructive); }
@media (max-width:420px) { .bars li { grid-template-columns:minmax(0,1fr) auto; } .bars li > :first-child { grid-column:1 / -1; } }
.legend { display:flex; flex-wrap:wrap; gap:4px 14px; margin:0 0 8px; padding:0; list-style:none; color:var(--muted-foreground); font-size:12px; }
.legend .bar { display:inline-block; width:10px; height:10px; margin-right:6px; vertical-align:-1px; }
svg .mark { fill:var(--primary); } svg .mark.baseline { fill:color-mix(in oklab,var(--muted-foreground) 35%,transparent); stroke:var(--muted-foreground); }
svg .mark.up { fill:var(--success); } svg .mark.down { fill:var(--destructive); }
svg .line { fill:none; stroke:var(--primary); stroke-width:2; } svg .axis,svg .gridline { stroke:var(--border); fill:none; }
figure > svg { display:block; width:100%; height:auto; overflow:visible; }
meter,progress { -webkit-appearance:none; appearance:none; display:inline-block; width:100%; min-width:80px; max-width:240px; height:8px; border:0; border-radius:999px; background:var(--muted); vertical-align:middle; overflow:hidden; }
progress::-webkit-progress-bar { background:var(--muted); border-radius:999px; } progress::-webkit-progress-value { background:var(--primary); border-radius:999px; } progress::-moz-progress-bar { background:var(--primary); border-radius:999px; }
meter::-webkit-meter-inner-element { display:block; } meter::-webkit-meter-bar { height:8px; border:0; border-radius:999px; background:var(--muted); }
meter::-webkit-meter-optimum-value { background:var(--success); border-radius:999px; } meter::-webkit-meter-suboptimum-value { background:var(--primary); border-radius:999px; } meter::-webkit-meter-even-less-good-value { background:var(--destructive); border-radius:999px; }
meter:-moz-meter-optimum::-moz-meter-bar { background:var(--success); } meter:-moz-meter-sub-optimum::-moz-meter-bar { background:var(--primary); } meter:-moz-meter-sub-sub-optimum::-moz-meter-bar { background:var(--destructive); }
details { margin:0 0 12px; border-top:1px solid var(--border); border-bottom:1px solid var(--border); } details + details { border-top:0; }
summary { padding:8px 0; font-weight:600; cursor:pointer; } summary::marker { color:var(--muted-foreground); } details[open] > summary { margin-bottom:4px; }
tr.highlight > * { font-weight:600; } tr.highlight > :first-child { box-shadow:inset 2px 0 0 var(--primary); padding-left:10px; }
.agent-reference { display:inline; font-size:0.92em; }
.agent-reference button { display:inline; border:0; padding:0; background:none; color:inherit; font:inherit; cursor:pointer; }
.agent-reference button:focus-visible { outline:2px solid var(--primary); outline-offset:2px; border-radius:20px; }
.agent-reference > span,.agent-reference button > span { display:inline-flex; align-items:center; gap:4px; max-width:100%; padding:1px 8px; margin:0 2px; border:1px solid var(--border); border-radius:20px; background:var(--muted); font-weight:500; vertical-align:baseline; }
.agent-reference svg { width:14px; height:14px; flex-shrink:0; }
.agent-reference span span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
`;

/** CSS stays inside the frame; scripts, external resources and navigation are blocked. */
export const buildSandboxedSrcDoc = (html: string): string => {
  const content = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      'script',
      'meta',
      'base',
      'iframe',
      'object',
      'embed',
      'link',
      'form',
      'input',
      'button',
      'textarea',
      'select',
    ],
    FORBID_ATTR: ['srcdoc', 'autofocus', 'contenteditable'],
  });
  // Prepend the policy before model-provided CSS or content is parsed.
  return content.replace(
    '<head>',
    `<head><meta http-equiv="Content-Security-Policy" content="${CSP_DIRECTIVES}"><meta name="viewport" content="width=device-width, initial-scale=1"><style data-agent-renderer>${BASE_STYLES}</style>`,
  );
};
