export type TShareLang = 'en' | 'mn';

type TShareKind = { pattern: RegExp; label: Record<TShareLang, string>; tone: string };

const KINDS: TShareKind[] = [
  { pattern: /sheet|excel|csv/, label: { en: 'Spreadsheet', mn: 'Хүснэгт' }, tone: '22 163 74' },
  {
    pattern: /presentation|powerpoint/,
    label: { en: 'Presentation', mn: 'Танилцуулга' },
    tone: '234 88 12',
  },
  { pattern: /word|document|rtf/, label: { en: 'Document', mn: 'Баримт бичиг' }, tone: '37 99 235' },
  {
    pattern: /zip|rar|7z|tar|gzip|compressed/,
    label: { en: 'Archive', mn: 'Архив' },
    tone: '202 138 4',
  },
];

const OTHER: Omit<TShareKind, 'pattern'> = {
  label: { en: 'File', mn: 'Файл' },
  tone: '113 113 122',
};

type TShareText = {
  download: string;
  footer: string;
  gone: string;
  goneHint: string;
  error: string;
  errorHint: string;
};

const TEXT: Record<TShareLang, TShareText> = {
  en: {
    download: 'Download',
    footer: 'Shared with you through erxes',
    gone: 'This link is no longer available',
    goneHint: 'It was turned off or the file was removed. Ask the person who shared it for a new link.',
    error: 'This file can’t be opened right now',
    errorHint: 'The link still works. Try again in a few minutes.',
  },
  mn: {
    download: 'Татаж авах',
    footer: 'erxes-ээр тантай хуваалцсан',
    gone: 'Энэ link идэвхгүй болсон',
    goneHint: 'Link-ийг унтраасан эсвэл файлыг устгасан байна. Хуваалцсан хүнээс шинэ link аваарай.',
    error: 'Файлыг одоогоор нээх боломжгүй байна',
    errorHint: 'Link хүчинтэй хэвээр байна. Хэдэн минутын дараа дахин оролдоно уу.',
  },
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] || ch,
  );

const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }

  return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
};

const PAGE_CSS = `
:root{color-scheme:light dark;--bg:#f4f4f5;--card:#fff;--text:#18181b;--muted:#71717a;--border:#e4e4e7}
@media (prefers-color-scheme:dark){:root{--bg:#09090b;--card:#18181b;--text:#fafafa;--muted:#a1a1aa;--border:#27272a}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:var(--bg);color:var(--text);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:16px}
.card{width:100%;max-width:380px;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:32px 24px;text-align:center}
.tile{width:64px;height:64px;margin:0 auto 16px;border-radius:14px;display:flex;align-items:center;justify-content:center;
font-weight:600;font-size:13px;letter-spacing:.04em;color:rgb(var(--tone));background:rgb(var(--tone)/.12)}
h1{font-size:17px;font-weight:600;margin:0 0 4px;word-break:break-word}.meta{color:var(--muted);font-size:13px;margin:0 0 24px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;height:42px;border-radius:10px;
background:#4f46e5;color:#fff;text-decoration:none;font-weight:500}.btn:hover{background:#4338ca}
footer{margin-top:24px;color:var(--muted);font-size:12px}`;

const DOWNLOAD_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M7 11l5 5l5-5"/><path d="M12 4v12"/></svg>';

const layout = (lang: TShareLang, title: string, body: string) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${PAGE_CSS}</style></head>
<body><main class="card">${body}<footer>${TEXT[lang].footer}</footer></main></body></html>`;

export const renderSharePage = ({
  name,
  size,
  mimeType,
  ext,
  downloadUrl,
  lang,
}: {
  name: string;
  size: number;
  mimeType: string;
  ext?: string;
  downloadUrl: string;
  lang: TShareLang;
}) => {
  const kind = KINDS.find((k) => k.pattern.test(mimeType)) || OTHER;
  const badge = escapeHtml((ext || mimeType.split('/').pop() || '').slice(0, 4).toUpperCase());

  return layout(
    lang,
    name,
    `<div class="tile" style="--tone:${kind.tone}">${badge}</div>
<h1>${escapeHtml(name)}</h1><p class="meta">${kind.label[lang]} · ${formatSize(size)}</p>
<a class="btn" href="${escapeHtml(downloadUrl)}">${DOWNLOAD_ICON}${TEXT[lang].download}</a>`,
  );
};

export const renderShareGonePage = (lang: TShareLang) =>
  layout(
    lang,
    TEXT[lang].gone,
    `<div class="tile" style="--tone:${OTHER.tone}">?</div>
<h1>${TEXT[lang].gone}</h1><p class="meta" style="margin:0">${TEXT[lang].goneHint}</p>`,
  );

export const renderShareErrorPage = (lang: TShareLang) =>
  layout(
    lang,
    TEXT[lang].error,
    `<div class="tile" style="--tone:${OTHER.tone}">!</div>
<h1>${TEXT[lang].error}</h1><p class="meta" style="margin:0">${TEXT[lang].errorHint}</p>`,
  );
