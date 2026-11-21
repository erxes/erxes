import {
  broadcastRecipients,
  broadcasts,
  type Db,
  newId,
  suppressions,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { type Request, Router } from 'express';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { escapeHtml } from '~/modules/email/templates';
import { organizationName } from './broadcasts.service';
import { isRecipientSignature, isTargetSignature } from './links';

const Params = z.object({ recipientId: z.string().max(64), sig: z.string().max(128) });

/** The recipient a signed address names, and its organisation. */
const recipientOf = async (req: Request) => {
  const { recipientId, sig } = Params.parse(req.params);

  if (!isRecipientSignature(recipientId, sig)) throw fail('INVALID_SIGNATURE', 'Invalid link');

  const [owner] = await withSystem('broadcast link lookup', (tx) =>
    tx
      .select({ orgId: broadcastRecipients.orgId })
      .from(broadcastRecipients)
      .where(eq(broadcastRecipients.id, recipientId))
      .limit(1),
  );

  return owner ? { recipientId, orgId: owner.orgId } : null;
};

/** Sets a recipient's first-time column (opened, clicked); later ones keep the first. */
const markFirst = (tx: Db, recipientId: string, column: 'openedAt' | 'clickedAt') =>
  tx
    .update(broadcastRecipients)
    .set({ [column]: new Date() })
    .where(and(eq(broadcastRecipients.id, recipientId), isNull(broadcastRecipients[column])));

/** Suppresses the recipient's address on its channel and marks the recipient unsubscribed. */
const unsubscribe = async (tx: Db, recipientId: string) => {
  const [recipient] = await tx
    .update(broadcastRecipients)
    .set({ unsubscribedAt: sql`coalesce(${broadcastRecipients.unsubscribedAt}, now())` })
    .where(eq(broadcastRecipients.id, recipientId))
    .returning({
      address: broadcastRecipients.address,
      broadcastId: broadcastRecipients.broadcastId,
    });

  if (!recipient) return;

  const [broadcast] = await tx
    .select({ channel: broadcasts.channel })
    .from(broadcasts)
    .where(eq(broadcasts.id, recipient.broadcastId))
    .limit(1);

  if (!broadcast) return;

  // An earlier manual or bounce entry becomes the person's own word.
  await tx
    .insert(suppressions)
    .values({
      id: newId(),
      channel: broadcast.channel,
      address: recipient.address,
      reason: 'unsubscribed',
      broadcastId: recipient.broadcastId,
    })
    .onConflictDoUpdate({
      target: [suppressions.orgId, suppressions.channel, suppressions.address],
      set: { reason: 'unsubscribed', broadcastId: recipient.broadcastId },
    });
};

/** A small page in the organisation's name. */
const page = (title: string, body: string) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:48px 16px;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111">
<main style="max-width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;text-align:center">${body}</main></body></html>`;

const nameOf = (orgId: string) => withOrg(orgId, (tx) => organizationName(tx));

/** A transparent 1×1 GIF. */
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

/**
 * `/core/v1/b/:recipientId/:sig/…`: the links in a broadcast copy. The
 * signature proves the address was made for that recipient.
 *
 * - `GET unsubscribe` asks to confirm (link scanners open links, so a GET
 *   changes nothing); `POST unsubscribe` does it, which is also what an
 *   inbox's own unsubscribe button sends (RFC 8058).
 * - `GET open.gif` counts the first open.
 * - `GET click?u=&s=` counts the first click and redirects to `u`, which the
 *   copy signed, so the address redirects nowhere else.
 */
export const broadcastLinksRouter = Router();

broadcastLinksRouter.get('/b/:recipientId/:sig/unsubscribe', async (req, res) => {
  const found = await recipientOf(req);
  const organization = found ? await nameOf(found.orgId) : null;

  res.type('html').send(
    page(
      'Unsubscribe',
      found && organization
        ? `<p style="margin:0 0 20px">Stop getting these messages from ${escapeHtml(organization)}?</p>
<form method="post"><button type="submit" style="padding:10px 24px;font-size:14px;color:#fff;background:#5629b6;border:0;border-radius:8px;cursor:pointer">Unsubscribe</button></form>`
        : '<p style="margin:0">This link no longer works.</p>',
    ),
  );
});

broadcastLinksRouter.post('/b/:recipientId/:sig/unsubscribe', async (req, res) => {
  const found = await recipientOf(req);

  if (!found) {
    res
      .status(404)
      .type('html')
      .send(page('Unsubscribe', '<p style="margin:0">This link no longer works.</p>'));

    return;
  }

  const organization = await withOrg(found.orgId, async (tx) => {
    await unsubscribe(tx, found.recipientId);

    return organizationName(tx);
  });

  res
    .type('html')
    .send(
      page(
        'Unsubscribed',
        `<p style="margin:0">You won't get these messages from ${escapeHtml(organization)} any more.</p>`,
      ),
    );
});

broadcastLinksRouter.get('/b/:recipientId/:sig/open.gif', async (req, res) => {
  const found = await recipientOf(req);

  if (found) await withOrg(found.orgId, (tx) => markFirst(tx, found.recipientId, 'openedAt'));

  res.set('Cache-Control', 'no-store').type('gif').send(PIXEL);
});

const Click = z.object({ u: z.url({ protocol: /^https?$/ }).max(4000), s: z.string().max(128) });

broadcastLinksRouter.get('/b/:recipientId/:sig/click', async (req, res) => {
  const { recipientId } = Params.parse(req.params);
  const click = Click.safeParse(req.query);

  if (!click.success || !isTargetSignature(recipientId, click.data.u, click.data.s)) {
    throw fail('INVALID_SIGNATURE', 'Invalid link');
  }

  const found = await recipientOf(req);

  // A click shows the email was opened too, even when its pictures weren't.
  if (found) {
    await withOrg(found.orgId, async (tx) => {
      await markFirst(tx, found.recipientId, 'clickedAt');
      await markFirst(tx, found.recipientId, 'openedAt');
    });
  }

  res.redirect(302, click.data.u);
});
