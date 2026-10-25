/**
 * Self-contained widget styles. The chart renders inside a shadow root in the
 * sandboxed report frame, where host Tailwind/erxes-ui CSS does not exist and
 * model CSS cannot reach. Colors come from the host tokens synced onto the frame.
 */
export const WHAT_IF_CHART_STYLES = `
:host { display:block; }
.aw { --aw-up:var(--success,#16a34a); --aw-down:var(--destructive,#dc2626); --aw-base:color-mix(in oklab,var(--muted-foreground) 30%,transparent); margin:16px 0; padding:16px; border:1px solid var(--border); border-radius:12px; color:var(--foreground); font-size:13px; line-height:1.5; text-align:left; }
.aw *,.aw *::before,.aw *::after { box-sizing:border-box; }
.aw button,.aw input { font:inherit; color:inherit; }
.aw :focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
.aw-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.aw-head { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
.aw-titlebar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px 12px; }
.aw-title { margin:0; font-size:15px; font-weight:600; line-height:1.35; letter-spacing:-0.01em; }
.aw-badge { display:inline-flex; align-items:center; gap:6px; padding:2px 8px; border:1px solid var(--border); border-radius:999px; color:var(--muted-foreground); font-size:11px; font-weight:500; white-space:nowrap; }
.aw-badge::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--primary); }
.aw-note { display:flex; align-items:flex-start; gap:6px; margin:0; color:var(--muted-foreground); font-size:12px; }
.aw-note svg { flex-shrink:0; margin-top:2px; }
.aw-note-text[data-clamped] { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.aw-link { align-self:flex-start; margin-left:20px; padding:0; border:0; border-radius:4px; background:none; color:var(--primary); font-size:12px; font-weight:500; cursor:pointer; }
.aw-section { margin:0 0 18px; }
.aw-section:last-of-type { margin-bottom:0; }
.aw-section-head { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; margin:0 0 10px; }
.aw-eyebrow { margin:0; color:var(--muted-foreground); font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }
.aw-btn { display:inline-flex; align-items:center; gap:6px; height:28px; padding:0 10px; border:1px solid var(--border); border-radius:8px; background:transparent; font-size:12px; font-weight:500; cursor:pointer; transition:background-color .15s,color .15s; }
.aw-btn:hover:not(:disabled) { background:var(--muted); }
.aw-btn:disabled { color:var(--muted-foreground); cursor:not-allowed; opacity:.55; }
.aw-inputs { display:grid; gap:16px; }
@media (min-width:600px) { .aw-inputs { grid-template-columns:repeat(2,minmax(0,1fr)); column-gap:24px; } }
.aw-field { display:grid; gap:6px; min-width:0; }
.aw-field-head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.aw-label { min-width:0; font-size:12.5px; font-weight:500; }
.aw-hint { margin:-2px 0 0; color:var(--muted-foreground); font-size:11.5px; }
.aw-control { display:flex; align-items:center; gap:10px; }
.aw-slider-wrap { position:relative; flex:1 1 auto; min-width:72px; }
.aw-slider { --aw-pos:calc(8px + (100% - 16px) * var(--aw-fill,0)); display:block; width:100%; height:22px; margin:0; background:transparent; cursor:pointer; -webkit-appearance:none; appearance:none; }
.aw-slider:focus-visible { outline:none; }
.aw-slider::-webkit-slider-runnable-track { height:4px; border-radius:999px; background:linear-gradient(to right,var(--primary) var(--aw-pos),var(--border) var(--aw-pos)); }
.aw-slider::-moz-range-track { height:4px; border-radius:999px; background:var(--border); }
.aw-slider::-moz-range-progress { height:4px; border-radius:999px; background:var(--primary); }
.aw-slider::-webkit-slider-thumb { width:16px; height:16px; margin-top:-6px; border:2px solid var(--primary); border-radius:50%; background:var(--background); -webkit-appearance:none; appearance:none; transition:transform .15s,box-shadow .15s; }
.aw-slider::-moz-range-thumb { width:12px; height:12px; border:2px solid var(--primary); border-radius:50%; background:var(--background); transition:transform .15s,box-shadow .15s; }
.aw-slider:active::-webkit-slider-thumb { transform:scale(1.15); }
.aw-slider:active::-moz-range-thumb { transform:scale(1.15); }
.aw-slider:focus-visible::-webkit-slider-thumb { box-shadow:0 0 0 4px color-mix(in oklab,var(--primary) 30%,transparent); }
.aw-slider:focus-visible::-moz-range-thumb { box-shadow:0 0 0 4px color-mix(in oklab,var(--primary) 30%,transparent); }
.aw-tick { position:absolute; top:calc(50% + 5px); left:calc(8px + (100% - 16px) * var(--aw-mark,0)); width:2px; height:5px; margin-left:-1px; border-radius:1px; background:var(--muted-foreground); pointer-events:none; }
.aw-number { display:flex; flex:0 0 auto; align-items:center; gap:4px; width:clamp(6.5rem,42%,10rem); height:30px; padding:0 8px; border:1px solid var(--border); border-radius:8px; background:var(--background); transition:border-color .15s,box-shadow .15s; }
.aw-number:focus-within { border-color:var(--primary); box-shadow:0 0 0 3px color-mix(in oklab,var(--primary) 20%,transparent); }
.aw-number[data-invalid] { border-color:var(--aw-down); }
.aw-number input { flex:1 1 auto; width:100%; min-width:0; padding:0; border:0; outline:none; background:transparent; font-size:13px; font-variant-numeric:tabular-nums; text-align:right; }
.aw-affix { color:var(--muted-foreground); font-size:12px; white-space:nowrap; }
.aw-range { display:flex; justify-content:space-between; gap:8px; color:var(--muted-foreground); font-size:11px; font-variant-numeric:tabular-nums; }
.aw-chip { display:inline-flex; flex-shrink:0; align-items:center; gap:2px; padding:1px 7px; border-radius:999px; background:color-mix(in oklab,var(--muted-foreground) 14%,transparent); color:var(--muted-foreground); font-size:11px; font-weight:600; line-height:1.5; font-variant-numeric:tabular-nums; white-space:nowrap; }
.aw-chip[data-tone=changed] { background:color-mix(in oklab,var(--primary) 14%,transparent); color:color-mix(in oklab,var(--primary) 80%,var(--foreground)); }
.aw-chip[data-tone=positive] { background:color-mix(in oklab,var(--aw-up) 16%,transparent); color:color-mix(in oklab,var(--aw-up) 68%,var(--foreground)); }
.aw-chip[data-tone=negative] { background:color-mix(in oklab,var(--aw-down) 16%,transparent); color:color-mix(in oklab,var(--aw-down) 72%,var(--foreground)); }
.aw-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; margin:0 0 16px; }
.aw-kpi { min-width:0; padding:10px 12px; border:1px solid var(--border); border-radius:10px; }
.aw-kpi-label { margin:0; color:var(--muted-foreground); font-size:12px; font-weight:500; }
.aw-kpi-hint { margin:0; color:var(--muted-foreground); font-size:11px; }
.aw-kpi-value { margin:2px 0 0; font-size:20px; font-weight:600; line-height:1.25; letter-spacing:-0.02em; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.aw-kpi-value[data-unavailable] { color:var(--muted-foreground); font-size:13px; font-weight:500; letter-spacing:0; }
.aw-kpi-foot { display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; margin-top:6px; color:var(--muted-foreground); font-size:11.5px; font-variant-numeric:tabular-nums; }
.aw-legend { display:flex; flex-wrap:wrap; align-items:center; gap:4px 12px; margin:0 0 10px; color:var(--muted-foreground); font-size:11.5px; }
.aw-swatch { display:inline-block; width:10px; height:10px; margin-right:5px; border-radius:3px; vertical-align:-1px; }
.aw-swatch[data-series=baseline],.aw-bar[data-series=baseline] { background:var(--aw-base); box-shadow:inset 0 0 0 1px var(--muted-foreground); }
.aw-swatch[data-series=scenario],.aw-bar[data-series=scenario] { background:var(--primary); }
.aw-seg { display:inline-flex; gap:2px; padding:2px; border:1px solid var(--border); border-radius:8px; }
.aw-seg button { height:24px; padding:0 9px; border:0; border-radius:6px; background:transparent; color:var(--muted-foreground); font-size:12px; font-weight:500; cursor:pointer; }
.aw-seg button[aria-pressed=true] { background:var(--muted); color:var(--foreground); }
.aw-chart { display:grid; gap:14px; margin:0; }
.aw-group { display:grid; gap:5px; min-width:0; }
.aw-group-label { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12px; font-weight:500; }
.aw-bar-row { display:grid; grid-template-columns:minmax(0,1fr) 5.75rem; align-items:center; gap:10px; }
.aw-track { position:relative; height:14px; border-radius:4px; background:color-mix(in oklab,var(--muted) 70%,transparent); }
.aw-bar { position:absolute; top:0; bottom:0; left:calc(var(--aw-left,0) * 100%); width:max(2px,calc(var(--aw-width,0) * 100%)); border-radius:4px; transition:left .35s cubic-bezier(.2,.8,.2,1),width .35s cubic-bezier(.2,.8,.2,1); }
.aw-bar[data-zero] { width:0; }
.aw-zero { position:absolute; top:-3px; bottom:-3px; left:calc(var(--aw-left,0) * 100%); width:1px; background:var(--muted-foreground); }
.aw-bar-value { overflow:hidden; color:var(--muted-foreground); font-size:12px; font-variant-numeric:tabular-nums; text-align:right; text-overflow:ellipsis; white-space:nowrap; }
.aw-bar-value[data-series=scenario] { color:var(--foreground); font-weight:600; }
.aw-caption { margin:12px 0 0; color:var(--muted-foreground); font-size:11px; }
.aw-table-wrap { overflow-x:auto; }
.aw-table { width:100%; border-collapse:collapse; font-size:12.5px; font-variant-numeric:tabular-nums; }
.aw-table th,.aw-table td { padding:7px 8px; border-bottom:1px solid var(--border); text-align:right; white-space:nowrap; }
.aw-table th:first-child,.aw-table td:first-child { padding-left:0; text-align:left; white-space:normal; }
.aw-table th:last-child,.aw-table td:last-child { padding-right:0; }
.aw-table thead th { color:var(--muted-foreground); font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }
.aw-table tbody tr:last-child td { border-bottom:0; }
.aw-table td[data-tone=positive] { color:color-mix(in oklab,var(--aw-up) 68%,var(--foreground)); }
.aw-table td[data-tone=negative] { color:color-mix(in oklab,var(--aw-down) 72%,var(--foreground)); }
@media (max-width:360px) { .aw { padding:12px; } .aw-kpi-value { font-size:18px; } }
@media (prefers-reduced-motion:reduce) { .aw *,.aw *::before,.aw *::after { transition:none !important; animation:none !important; } }
`;
