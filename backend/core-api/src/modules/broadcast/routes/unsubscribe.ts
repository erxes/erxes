import { Request, Response, Router } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { routeErrorHandling } from '../utils';

/**
 * Campaign mail carries `cid` (a customer), notification mail carries `uid` (a
 * team member). Both end up in the same place, so one endpoint serves both.
 */
const unsubscribe = async (models: IModels, query: Request['query']) => {
  const customerId = String(query.cid || '');
  const userId = String(query.uid || '');

  if (customerId) {
    await models.Customers.updateOne(
      { _id: customerId },
      { $set: { isSubscribed: 'No' } },
    );

    return true;
  }

  if (userId) {
    await models.Users.updateOne(
      { _id: userId },
      { $set: { isSubscribed: 'No' } },
    );

    return true;
  }

  return false;
};

const page = (title: string, message: string) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 60px 20px;">
            <table border="0" cellpadding="0" cellspacing="0" width="480" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="padding: 40px; text-align: center;">
                  <h1 style="margin: 0 0 12px; font-size: 20px;">${title}</h1>
                  <div style="color: #666; font-size: 14px; line-height: 1.5;">${message}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const confirmPage = (action: string) =>
  page(
    'Unsubscribe',
    `
      <p>Stop receiving these emails?</p>
      <form method="POST" action="${action}">
        <button type="submit" style="margin-top: 8px; padding: 10px 20px; font-size: 14px; color: #ffffff; background-color: #5629b6; border: 0; border-radius: 6px; cursor: pointer;">
          Unsubscribe
        </button>
      </form>
    `,
  );

const router: Router = Router();

/**
 * Deliberately does not unsubscribe anyone. Corporate mail scanners follow
 * every link in a message before the recipient ever sees it, so a GET that
 * acted would unsubscribe people who never clicked. The button below posts.
 */
router.get(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    return res.send(confirmPage(req.originalUrl));
  }),
);

/**
 * Also what `List-Unsubscribe-Post` calls, which is why it must go through
 * without a confirmation step of its own.
 */
router.post(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    const models = await generateModels(getSubdomain(req));

    const done = await unsubscribe(models, req.query);

    if (!done) {
      return res.status(400).send(page('Unsubscribe', 'This link is invalid.'));
    }

    return res.send(
      page('Unsubscribed', 'You will no longer receive these emails.'),
    );
  }),
);

export { router };
