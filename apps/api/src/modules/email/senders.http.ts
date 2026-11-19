import { emailSenders, runAs, system, withOrg, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { type Request, Router } from 'express';
import { z } from 'zod';
import { organizationName } from '~/modules/broadcasts/broadcasts.service';
import { confirmSender, isSenderSignature } from './senders.service';
import { escapeHtml, linkPage, linkPageButton } from './templates';

const Params = z.object({ senderId: z.string().max(64), sig: z.string().max(128) });

/** The sender a signed link names, with its organisation's name; null when the link no longer works. */
const senderOf = async (req: Request) => {
  const params = Params.safeParse(req.params);

  if (!params.success) return null;

  const { senderId, sig } = params.data;

  const [sender] = await withSystem('sender link lookup', (tx) =>
    tx.select().from(emailSenders).where(eq(emailSenders.id, senderId)).limit(1),
  );

  if (!sender || !isSenderSignature(sender, sig)) return null;

  return sender;
};

const gone = linkPage(
  'Confirm sender',
  '<p style="margin:0">This link no longer works. Ask for a new one in erxes.</p>',
);

/**
 * `/core/v1/email/senders/:senderId/:sig/confirm`: the link emailed to a new
 * sender. `GET` asks (link scanners open links, so a GET changes nothing);
 * `POST` confirms the address.
 */
export const senderLinksRouter = Router();

senderLinksRouter.get('/email/senders/:senderId/:sig/confirm', async (req, res) => {
  const sender = await senderOf(req);

  if (!sender) {
    res.status(404).type('html').send(gone);

    return;
  }

  const organization = await withOrg(sender.orgId, (tx) => organizationName(tx));

  res.type('html').send(
    linkPage(
      'Confirm sender',
      sender.confirmedAt
        ? `<p style="margin:0">${escapeHtml(sender.email)} is confirmed already.</p>`
        : `<p style="margin:0 0 20px">Let ${escapeHtml(organization)} send emails as <b>${escapeHtml(sender.email)}</b> from erxes?</p>
${linkPageButton('Confirm')}`,
    ),
  );
});

senderLinksRouter.post('/email/senders/:senderId/:sig/confirm', async (req, res) => {
  const sender = await senderOf(req);

  if (!sender) {
    res.status(404).type('html').send(gone);

    return;
  }

  const organization = await withOrg(sender.orgId, (tx) =>
    runAs(system('sender confirmation link'), async () => {
      await confirmSender(tx, sender);

      return organizationName(tx);
    }),
  );

  res
    .type('html')
    .send(
      linkPage(
        'Sender confirmed',
        `<p style="margin:0">${escapeHtml(organization)} can now send emails as <b>${escapeHtml(sender.email)}</b>.</p>`,
      ),
    );
});
