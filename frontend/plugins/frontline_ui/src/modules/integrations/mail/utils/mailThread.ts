import type {
  ComposeMode,
  EmailAddress,
  MailMessage,
} from '@/integrations/mail/types/mailThread';

export const formatAddresses = (emails?: EmailAddress[]) =>
  (emails ?? [])
    .map((email) => email.name || email.email || '')
    .filter(Boolean)
    .join(', ');

export const mailMessagePreview = (message: MailMessage) => {
  const html = message.mailData.newContent ?? message.mailData.body;
  if (!html) return message.mailData.subject ?? '';

  const doc = new DOMParser().parseFromString(
    html
      .replace(/<br\s*(?:\/\s*)?>/gi, ' ')
      .replace(/<\/(?:p|div|li|blockquote)>/gi, ' '),
    'text/html',
  );
  doc
    .querySelectorAll('blockquote, .gmail_quote, .yahoo_quoted')
    .forEach((quote) => quote.remove());
  return (doc.body.textContent ?? '')
    .split(/On (?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),? \d{1,2} /i)[0]
    .replace(/\s+/g, ' ')
    .trim();
};

export const senderInitial = (name?: string, email?: string) =>
  (name || email || '?')[0].toUpperCase();

export const formatAttachmentSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const stripSubjectPrefix = (subject: string) =>
  subject.replace(/^((re|fwd?):\s*)+/gi, '').trim();

const AVATAR_BG = [
  '#1a73e8',
  '#e52592',
  '#188038',
  '#f29900',
  '#9334e6',
  '#d93025',
  '#0097a7',
  '#795548',
];

export const senderAvatarBg = (name?: string, email?: string) => {
  const value = name || email || '?';
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + (value.codePointAt(index) ?? 0)) & 0xffffffff;
  }
  return AVATAR_BG[Math.abs(hash) % AVATAR_BG.length];
};

export const buildQuote = (message: MailMessage) =>
  `<br/><br/><blockquote style="border-left:3px solid #1a73e8;margin:0;padding-left:12px;color:#5f6368"><p style="margin:0 0 4px;font-size:12px"><b>On ${new Date(
    message.createdAt,
  ).toLocaleString()}, ${
    formatAddresses(message.mailData.from) || 'Unknown'
  } wrote:</b></p>${message.mailData.body ?? ''}</blockquote>`;

export const deriveSenderAddress = (messages: MailMessage[]) => {
  for (const message of messages) {
    if (message.mailData.type === 'INBOX' && message.mailData.to?.[0]?.email) {
      return message.mailData.to[0].email;
    }
    if (message.mailData.type === 'SENT' && message.mailData.from?.[0]?.email) {
      return message.mailData.from[0].email;
    }
  }
  return '';
};

export const getReplyRecipients = (message: MailMessage, mode: ComposeMode) => {
  if (mode === 'forward') return [];
  const { type, from, to } = message.mailData;
  return (type === 'SENT' ? to ?? [] : from ?? [])
    .map(({ email }) => email ?? '')
    .filter(Boolean);
};

export const getReplyCc = (
  message: MailMessage,
  mode: ComposeMode,
  fromEmail: string,
) => {
  if (mode !== 'replyAll') return [];
  return [
    ...(message.mailData.to ?? []).map(({ email }) => email ?? ''),
    ...(message.mailData.cc ?? []).map(({ email }) => email ?? ''),
  ].filter((email) => Boolean(email) && email !== fromEmail);
};
