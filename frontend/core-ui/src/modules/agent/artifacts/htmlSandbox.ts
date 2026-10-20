import DOMPurify from 'dompurify';

const CSP_DIRECTIVES =
  "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; base-uri 'none'; form-action 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'";

const BASE_STYLES = `
:root { color-scheme: light dark; --background:#fff; --foreground:#242424; --muted:#f4f4f5; --muted-foreground:#71717a; --border:#e4e4e7; --primary:#635bdf; }
@media (prefers-color-scheme:dark) { :root { --background:#1b1b1b; --foreground:#f5f5f5; --muted:#27272a; --muted-foreground:#a1a1aa; --border:#3f3f46; } }
* { box-sizing:border-box; }
html { overflow-x:auto; }
body { display:flow-root; margin:0; padding:0; background:transparent; color:var(--foreground); font:14px/1.65 system-ui,sans-serif; overflow-wrap:anywhere; }
body > :first-child { margin-top:0; } body > :last-child { margin-bottom:0; }
p,ul,ol,blockquote,pre,table { margin:0 0 12px; }
h1,h2,h3,h4 { line-height:1.3; margin:20px 0 10px; font-weight:600; }
h1 { font-size:24px; } h2 { font-size:20px; } h3 { font-size:16px; }
a { color:var(--primary); } img,svg,video { max-width:100%; }
table { border-collapse:collapse; width:100%; font-size:13px; }
th,td { padding:9px 12px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
th { font-weight:600; color:var(--muted-foreground); }
pre { padding:12px; overflow:auto; background:var(--muted); border-radius:8px; white-space:pre-wrap; }
code { font:0.9em ui-monospace,monospace; } blockquote { margin-left:0; padding-left:16px; border-left:2px solid var(--border); color:var(--muted-foreground); }
hr { border:0; border-top:1px solid var(--border); margin:20px 0; }
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
    ADD_ATTR: ['data-agent-chart'],
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
    `<head><meta http-equiv="Content-Security-Policy" content="${CSP_DIRECTIVES}"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${BASE_STYLES}</style>`,
  );
};
