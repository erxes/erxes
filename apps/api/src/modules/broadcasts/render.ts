import type { BroadcastChannel } from '@erxes/core-db';
import { escapeHtml } from '~/modules/email/templates';
import { recipientPaths } from './links';
import { fillPlaceholders, type PlaceholderValues } from './placeholders';

/** What a broadcast's copy is made from. */
export interface BroadcastContent {
  channel: BroadcastChannel;
  subject: string | null;
  preheader: string | null;
  /** SMS: the text. Email: the text part, rendered from the document when it was saved. */
  body: string;
  /** Email: the document rendered when it was saved (`emailBody.ts`). */
  html: string | null;
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

const HTML_ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&amp;': '&',
};

/** An attribute's value as the renderer escaped it, back to the address it stands for. */
const unescapeAttribute = (value: string) =>
  value.replace(/&(?:lt|gt|quot|amp|#x27|#39);/g, (entity) => HTML_ENTITIES[entity] ?? entity);

/** Each link's `href`, as the renderer writes it (double quotes, escaped). */
const LINK_HREF = /(<a\b[^>]*?\shref=")([^"]*)(")/gi;

/** Web links sent through `track`; mail and phone links, and anything else, as they are. */
const trackLinks = (html: string, track: ((href: string) => string) | null) =>
  track
    ? html.replace(LINK_HREF, (link: string, start: string, href: string, end: string) => {
        const target = unescapeAttribute(href);

        return isWebLink(target) ? `${start}${escapeHtml(track(target))}${end}` : link;
      })
    : html;

const STYLE = {
  hidden: 'display:none;max-height:0;overflow:hidden;opacity:0',
  footer:
    'max-width:600px;margin:16px auto 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:12px;color:#666;text-align:center',
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
  const organization = escapeHtml(values.organization);

  const unsubscribe = urls.unsubscribe
    ? `<a href="${escapeHtml(urls.unsubscribe)}" style="color:#666">Unsubscribe</a>`
    : 'Unsubscribe';

  const before = preheader ? `<div style="${STYLE.hidden}">${preheader}</div>` : '';

  const after = `<p style="${STYLE.footer}">You get this from ${organization}. ${unsubscribe}</p>${
    urls.open
      ? `<img src="${escapeHtml(urls.open)}" width="1" height="1" alt="" style="display:block">`
      : ''
  }`;

  // The preheader opens the body, the footer and open pixel close it.
  const html = trackLinks(fill(content.html ?? ''), urls.track)
    .replace(/<body\b[^>]*>/i, (tag) => `${tag}${before}`)
    .replace(/<\/body>/i, (tag) => `${after}${tag}`);

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
