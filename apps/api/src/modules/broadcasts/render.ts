import type { BroadcastChannel } from '@erxes/core-db';
import { Marked, type Tokens } from 'marked';
import { escapeHtml } from '~/modules/email/templates';
import { recipientPaths } from './links';
import { fillPlaceholders, type PlaceholderValues } from './placeholders';

/** What a broadcast's copy is made from. */
export interface BroadcastContent {
  channel: BroadcastChannel;
  subject: string | null;
  preheader: string | null;
  body: string;
}

/** One copy, as sent. */
export interface RenderedCopy {
  subject: string | null;
  html: string | null;
  text: string;
  /** RFC 8058 one-click unsubscribe, for inboxes that show their own button. */
  headers: Record<string, string>;
}

const isWebLink = (href: string) => /^https?:\/\//i.test(href);

/**
 * Markdown to HTML with raw HTML shown as text (a broadcast is written in
 * Markdown, never smuggles markup), and web links sent through `track`.
 */
const markdownToHtml = (markdown: string, track: ((href: string) => string) | null) =>
  new Marked({
    async: false,
    gfm: true,
    breaks: true,
    renderer: {
      html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
    },
    walkTokens: (token) => {
      if (token.type !== 'link' || !track || !('href' in token)) return;

      const href: unknown = token.href;

      if (typeof href === 'string' && isWebLink(href)) token.href = track(href);
    },
  }).parse(markdown, { async: false });

const STYLE = {
  body: 'margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111',
  card: 'max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;font-size:15px;line-height:1.6',
  footer: 'max-width:600px;margin:16px auto 0;font-size:12px;color:#666;text-align:center',
};

const emailCopy = (
  content: BroadcastContent,
  values: PlaceholderValues,
  urls: {
    unsubscribe: string | null;
    open: string | null;
    track: ((href: string) => string) | null;
  },
): RenderedCopy => {
  const fill = (text: string) => fillPlaceholders(text, values, escapeHtml);
  const subject = fillPlaceholders(content.subject ?? '', values);
  const preheader = content.preheader ? fill(escapeHtml(content.preheader)) : '';
  const body = fill(markdownToHtml(content.body, urls.track));
  const organization = escapeHtml(values.organization);

  const unsubscribe = urls.unsubscribe
    ? `<a href="${escapeHtml(urls.unsubscribe)}" style="color:#666">Unsubscribe</a>`
    : 'Unsubscribe';

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(subject)}</title></head>
<body style="${STYLE.body}">${
    preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>`
      : ''
  }
<div style="${STYLE.card}">${body}</div>
<p style="${STYLE.footer}">You get this from ${organization}. ${unsubscribe}</p>${
    urls.open
      ? `<img src="${escapeHtml(urls.open)}" width="1" height="1" alt="" style="display:block">`
      : ''
  }
</body></html>`;

  const text = [
    fillPlaceholders(content.body, values),
    '',
    '—',
    `You get this from ${values.organization}.`,
    ...(urls.unsubscribe ? [`Unsubscribe: ${urls.unsubscribe}`] : []),
  ].join('\n');

  return {
    subject,
    html,
    text,
    headers: urls.unsubscribe
      ? {
          'List-Unsubscribe': `<${urls.unsubscribe}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        }
      : {},
  };
};

const smsCopy = (
  content: BroadcastContent,
  values: PlaceholderValues,
  unsubscribe: string | null,
): RenderedCopy => ({
  subject: null,
  html: null,
  text: [
    fillPlaceholders(content.body, values).trim(),
    ...(unsubscribe ? [`Stop: ${unsubscribe}`] : []),
  ].join('\n'),
  headers: {},
});

/**
 * One customer's copy. With `recipientId` it carries that recipient's signed
 * unsubscribe link, open pixel and tracked links under `origin`; without
 * (previews, tests) links go straight to their targets and nothing is counted.
 */
export const renderCopy = (
  content: BroadcastContent,
  values: PlaceholderValues,
  tracking: { origin: string; recipientId: string } | null,
): RenderedCopy => {
  const paths = tracking ? recipientPaths(tracking.recipientId) : null;
  const at = (path: string) => `${tracking?.origin ?? ''}${path}`;
  const unsubscribe = paths ? at(paths.unsubscribe) : null;

  if (content.channel === 'sms') return smsCopy(content, values, unsubscribe);

  return emailCopy(content, values, {
    unsubscribe,
    open: paths ? at(paths.open) : null,
    track: paths ? (href) => at(paths.click(href)) : null,
  });
};
