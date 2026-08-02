import { getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import { generateModels } from '~/connectionResolvers';
import { routeErrorHandling } from '~/modules/broadcast/utils';
import { applyTemplate } from '~/utils/common';
import { confirmSender } from '~/utils/email/senders';

const router: Router = Router();

/**
 * Deliberately does not confirm anything. Corporate mail scanners follow every
 * link before the recipient sees it, so a GET that acted would let anyone claim
 * an address inside a scanned organization — the very thing this proves.
 */
router.get(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    return res.send(
      await applyTemplate(
        {
          title: 'Confirm sender address',
          body: `
            <p style="margin: 0 0 20px;">Allow replies to mail sent through erxes to arrive at this address?</p>
            <form method="POST" action="${req.originalUrl}">
              <button type="submit" style="padding: 10px 32px; font-size: 14px; color: #ffffff; background-color: #5629b6; border: 0; border-radius: 300px; cursor: pointer;">
                Confirm
              </button>
            </form>
          `,
        },
        'emailActionPage',
      ),
    );
  }),
);

router.post(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    const models = await generateModels(getSubdomain(req));

    const sender = await confirmSender(models, String(req.query.token || ''));

    if (!sender) {
      return res.status(400).send(
        await applyTemplate(
          {
            title: 'Link no longer valid',
            body: '<p style="margin: 0;">This link is invalid or has expired. Register the address again to get a new one.</p>',
          },
          'emailActionPage',
        ),
      );
    }

    return res.send(
      await applyTemplate(
        {
          title: 'Address confirmed',
          body: `<p style="margin: 0;">Replies can now be sent to <strong>${sender.email}</strong>.</p>`,
        },
        'emailActionPage',
      ),
    );
  }),
);

export { router };
