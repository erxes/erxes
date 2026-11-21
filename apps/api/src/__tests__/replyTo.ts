import { loggedEmails } from '~/modules/email/email';

/** The confirmation link last emailed to `email` (SaaS), as its token. */
export const replyToToken = (email: string) => {
  const sent = loggedEmails.findLast(
    (message) => message.to === email && message.subject.startsWith('Confirm replies'),
  );

  return new URL(/https?:\/\/\S+/.exec(sent?.text ?? '')?.[0] ?? 'http://none').searchParams.get(
    'token',
  );
};
