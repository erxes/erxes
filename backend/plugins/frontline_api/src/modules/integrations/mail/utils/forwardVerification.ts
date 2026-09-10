import {
  IMailForwardVerification,
  IMailIntegrationDocument,
} from '@/integrations/mail/@types/integration';
import { IInboundMailPayload } from '@/integrations/mail/@types/webhook';
import {
  MAIL_FORWARD_VERIFICATION_EXCERPT_LENGTH,
  MAIL_FORWARD_VERIFICATION_WINDOW_MS,
} from '@/integrations/mail/constants';
import { toPlainText } from '@/integrations/mail/utils/transports/common';

const VERIFICATION_SENDERS = new Set([
  'forwarding-noreply@google.com',
  'forwarding-noreply@gmail.com',
]);

const AUTOMATED_SENDER_PATTERN =
  /^(forward(ing)?|no-?reply|do-?not-?reply|postmaster|mailer-daemon)\b/i;

const VERIFICATION_SUBJECT_PATTERN =
  /(forward\w*[\s\S]{0,40}(confirm|verif|request))|((confirm|verif)\w*[\s\S]{0,40}forward)/i;

const CODE_PATTERN = /\b(\d{6,12})\b/;

const LINK_PATTERN = /https:\/\/[^\s"'<>]+/g;

const PREFERRED_LINK_PATTERN = /(forward|confirm|verif)/i;

const TRUSTED_LINK_HOSTS = [
  'google.com',
  'gmail.com',
  'microsoft.com',
  'outlook.com',
  'live.com',
  'office.com',
  'yahoo.com',
  'yahooinc.com',
  'zoho.com',
  'icloud.com',
  'apple.com',
  'proton.me',
];

const normalize = (value?: string) => (value || '').trim().toLowerCase();

export const isAwaitingForwardVerification = (
  integration: IMailIntegrationDocument,
) => {
  const startedAt = integration.forwardPendingAt;

  if (!startedAt) {
    return false;
  }

  return (
    Date.now() - new Date(startedAt).getTime() <
    MAIL_FORWARD_VERIFICATION_WINDOW_MS
  );
};

const looksLikeVerification = (payload: IInboundMailPayload) => {
  const sender = normalize(payload.from?.address);

  if (VERIFICATION_SENDERS.has(sender)) {
    return true;
  }

  if (!AUTOMATED_SENDER_PATTERN.test(sender.split('@')[0] ?? '')) {
    return false;
  }

  return VERIFICATION_SUBJECT_PATTERN.test(payload.subject ?? '');
};

const readCode = (subject: string, text: string) =>
  (CODE_PATTERN.exec(subject) ?? CODE_PATTERN.exec(text))?.[1] ?? '';

const isTrustedLink = (link: string) => {
  try {
    const { protocol, hostname } = new URL(link);

    if (protocol !== 'https:') {
      return false;
    }

    const host = hostname.toLowerCase();

    return TRUSTED_LINK_HOSTS.some(
      (trusted) => host === trusted || host.endsWith(`.${trusted}`),
    );
  } catch {
    return false;
  }
};

const readLink = (html: string) => {
  const links = (html.match(LINK_PATTERN) ?? []).filter(isTrustedLink);

  if (!links.length) {
    return '';
  }

  return links.find((link) => PREFERRED_LINK_PATTERN.test(link)) ?? links[0];
};

const readExcerpt = (text: string) =>
  text.length > MAIL_FORWARD_VERIFICATION_EXCERPT_LENGTH
    ? text.slice(0, MAIL_FORWARD_VERIFICATION_EXCERPT_LENGTH)
    : text;

export const captureForwardVerification = (
  integration: IMailIntegrationDocument,
  payload: IInboundMailPayload,
  body: string,
): IMailForwardVerification | null => {
  if (!isAwaitingForwardVerification(integration)) {
    return null;
  }

  if (!looksLikeVerification(payload)) {
    return null;
  }

  const subject = (payload.subject ?? '').trim();
  const text = toPlainText(body);

  return {
    from: normalize(payload.from?.address),
    subject,
    code: readCode(subject, text),
    link: readLink(body),
    excerpt: readExcerpt(text),
    receivedAt: new Date(),
  };
};
