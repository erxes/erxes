import { type Db, emailSenders } from '@erxes/core-db';
import { and, eq, isNotNull } from 'drizzle-orm';
import { fail } from '~/http/errors';

/** A confirmed sender an email goes out as. */
export interface Sender {
  name: string;
  email: string;
}

/** The address the organisation's or the server's emails go out from. */
export interface SendingAddress {
  name: string;
  address: string;
}

/** `Name <address>` or a bare address, as `EMAIL_FROM` holds it. */
export const parseFrom = (from: string): SendingAddress => {
  const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(from);

  return match ? { name: match[1] ?? '', address: match[2] ?? from } : { name: '', address: from };
};

const domainOf = (address: string) => address.split('@').pop()?.toLowerCase() ?? '';

/**
 * From and Reply-To for an email, as old core aligned them. The name is the
 * email's own, else the sender's, else the sending address's. A sender on the
 * sending address's domain is the From: the provider sends for that domain.
 * Any other sender keeps the sending address under that name and gets the
 * replies unless the email names its own Reply-To, so the email still passes
 * SPF and DMARC.
 */
export const addressing = (
  sending: SendingAddress,
  message: { fromName?: string; replyTo?: string; sender?: Sender | null },
) => {
  const { sender } = message;
  const name = message.fromName || sender?.name || sending.name;

  if (sender && domainOf(sender.email) === domainOf(sending.address)) {
    return { from: { name, address: sender.email }, replyTo: message.replyTo };
  }

  return {
    from: name ? { name, address: sending.address } : sending.address,
    replyTo: message.replyTo || sender?.email,
  };
};

/** The confirmed sender with this address; a removed or waiting one is null. */
export const confirmedSender = async (client: Db, email: string): Promise<Sender | null> => {
  const [sender] = await client
    .select({ name: emailSenders.name, email: emailSenders.email })
    .from(emailSenders)
    .where(
      and(eq(emailSenders.email, email.trim().toLowerCase()), isNotNull(emailSenders.confirmedAt)),
    )
    .limit(1);

  return sender ?? null;
};

/** 400 SENDER_NOT_CONFIRMED unless the address is one of the organisation's confirmed senders. */
export const assertConfirmedSender = async (client: Db, email: string | null | undefined) => {
  if (!email) return;

  if (!(await confirmedSender(client, email))) {
    throw fail('SENDER_NOT_CONFIRMED', `${email} is not a confirmed sender`);
  }
};
