import { BROADCAST_ATTACHMENTS_MAX_MB } from '@erxes/core-contract';
import {
  type BroadcastChannel,
  broadcastRecipients,
  broadcasts,
  type Db,
  files,
} from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { fail } from '~/http/errors';

const MB = 1024 * 1024;

/**
 * 400 unless each attachment is a ready file of the organisation (another's is
 * hidden by its scope) and together they fit `BROADCAST_ATTACHMENTS_MAX_MB`.
 */
export const assertAttachments = async (
  client: Db,
  channel: BroadcastChannel,
  ids: readonly string[],
) => {
  if (!ids.length) return;

  if (channel === 'sms') {
    const message = 'An SMS carries no attachments';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['attachmentIds'], message }] });
  }

  const rows = await client
    .select({ id: files.id, size: files.size })
    .from(files)
    .where(and(eq(files.status, 'ready'), inArray(files.id, [...ids])));

  const sizes = new Map(rows.map(({ id, size }) => [id, size]));
  const missing = ids.find((id) => !sizes.has(id));

  if (missing) {
    throw fail(
      'BROADCAST_ATTACHMENT_UNAVAILABLE',
      'An attached file was deleted or hasn’t finished uploading: remove it or upload it again',
      { id: missing },
    );
  }

  const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);

  if (total > BROADCAST_ATTACHMENTS_MAX_MB * MB) {
    throw fail(
      'BROADCAST_ATTACHMENTS_TOO_LARGE',
      `Attachments can be up to ${BROADCAST_ATTACHMENTS_MAX_MB} MB together`,
      { maxSizeMb: BROADCAST_ATTACHMENTS_MAX_MB },
    );
  }
};

/** Stops a sending broadcast whose attachment is gone; recipients still waiting are skipped. */
export const failForAttachment = async (tx: Db, broadcastId: string, reason: string) => {
  const failed = await tx
    .update(broadcasts)
    .set({ status: 'failed', error: reason, finishedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(broadcasts.id, broadcastId), eq(broadcasts.status, 'sending')))
    .returning({ id: broadcasts.id });

  if (!failed.length) return;

  await tx
    .update(broadcastRecipients)
    .set({ status: 'skipped', reason, updatedAt: new Date() })
    .where(
      and(
        eq(broadcastRecipients.broadcastId, broadcastId),
        eq(broadcastRecipients.status, 'queued'),
      ),
    );
};
