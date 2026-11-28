import type { CodeReply } from '@erxes/core-contract';
import { type Db, withOrg } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { logger } from '~/logger';
import {
  type Address,
  assertCanSend,
  CODE_SECONDS,
  type CodePortal,
  invalidCode,
  newCode,
  noReplies,
  type PhoneMethod,
  type Purpose,
  repliesTo,
  sendCode,
  useCode,
} from './customerCodes';
import { phoneReplyOf } from './signInConnections';

// Codes out of transactions: a portal with verify.mn has the customer text the code, and
// verify.mn is asked before and after, never while a transaction holds its rows.

const log = logger.child({ component: 'customer-codes' });

type IssuingPortal = CodePortal & { orgId: string };

type SendOptions = Omit<NonNullable<Parameters<typeof sendCode>[4]>, 'reply'>;

const replyUnavailable = () =>
  fail('SIGN_IN_UNAVAILABLE', "verify.mn didn't answer: try again in a moment");

const secondsUntil = (when: Date) => Math.max(0, Math.round((when.getTime() - Date.now()) / 1000));

/**
 * A new code for the address: sent to it, or, on a portal with verify.mn, made for the customer
 * to text from it (`reply` says where). A portal with both lets the customer pick (`method`),
 * the reply by default. `options` are worked out in the code's transaction.
 */
export const issueCode = async (
  portal: IssuingPortal,
  address: Address,
  purpose: Purpose,
  options: (tx: Db) => Promise<SendOptions>,
  method?: PhoneMethod,
): Promise<{ expiresInSeconds: number; reply: CodeReply | null }> => {
  const connectionId = repliesTo(portal, address, method);

  if (!connectionId && method === 'reply' && address.kind === 'phone') throw noReplies();

  if (!connectionId) {
    await withOrg(portal.orgId, async (tx) =>
      sendCode(tx, portal, address, purpose, await options(tx)),
    );

    return { expiresInSeconds: CODE_SECONDS, reply: null };
  }

  await withOrg(portal.orgId, (tx) => assertCanSend(tx, portal, address, 'reply'));

  const { phoneReply, client } = await phoneReplyOf(portal.orgId, connectionId);
  const code = newCode();

  const session = await phoneReply
    .start(client, { phone: address.value, text: code })
    .catch((error: unknown) => {
      log.warn({ err: error, portalId: portal.id }, 'phone reply session not started');

      throw replyUnavailable();
    });

  await withOrg(portal.orgId, async (tx) =>
    sendCode(tx, portal, address, purpose, {
      ...(await options(tx)),
      reply: { code, sessionId: session.sessionId, expiresAt: session.expiresAt },
    }),
  );

  return {
    expiresInSeconds: Math.min(CODE_SECONDS, secondsUntil(session.expiresAt)),
    reply: { to: session.to, text: code, smsUri: session.smsUri, instruction: session.instruction },
  };
};

/**
 * Uses the address's code: right, in time and, when the customer was to text it, texted from
 * that phone (verify.mn says so). 400 INVALID_CODE, 409 CODE_PENDING while not texted yet.
 * Each check is its own transaction, so a wrong try counts even though the call fails.
 */
export const proveCode = async (
  portal: Pick<IssuingPortal, 'id' | 'orgId' | 'phoneConnectionId'>,
  address: Address,
  purpose: Purpose,
  code: string,
  accountId?: string,
) => {
  const options = { ...(accountId && { accountId }) };

  const found = await withOrg(portal.orgId, (tx) =>
    useCode(tx, portal.id, address, purpose, code, { ...options, holdReplies: true }),
  );

  if (!found) throw invalidCode();

  if (!found.replySessionId) return found;

  if (!portal.phoneConnectionId) throw invalidCode();

  const { phoneReply, client } = await phoneReplyOf(portal.orgId, portal.phoneConnectionId);

  const status = await phoneReply.check(client, found.replySessionId).catch((error: unknown) => {
    log.warn({ err: error, portalId: portal.id }, 'phone reply session not checked');

    throw replyUnavailable();
  });

  if (status === 'pending') {
    throw fail('CODE_PENDING', 'Text the code from your phone first, then try again');
  }

  if (status === 'expired') throw invalidCode();

  const used = await withOrg(portal.orgId, (tx) =>
    useCode(tx, portal.id, address, purpose, code, options),
  );

  if (!used) throw invalidCode();

  return used;
};
