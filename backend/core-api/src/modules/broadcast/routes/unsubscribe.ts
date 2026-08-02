import { Request, Response, Router } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { routeErrorHandling } from '../utils';
import { applyTemplate } from '~/utils/common';

const unsubscribe = async (models: IModels, query: Request['query']) => {
  const customerId = String(query.cid || '');
  const userId = String(query.uid || '');

  if (customerId) {
    const customer = await models.Customers.findOneAndUpdate(
      { _id: customerId },
      { $set: { isSubscribed: 'No' } },
    );

    // The flag stops this contact; suppressing the address stops every other
    // record that carries it too.
    for (const email of [
      customer?.primaryEmail,
      ...(customer?.emails || []),
    ].filter(Boolean)) {
      await models.EmailAddresses.suppress(email as string, 'unsubscribe');
    }

    return true;
  }

  if (userId) {
    const user = await models.Users.findOneAndUpdate(
      { _id: userId },
      { $set: { isSubscribed: 'No' } },
    );

    if (user?.email) {
      await models.EmailAddresses.suppress(user.email, 'unsubscribe');
    }

    return true;
  }

  return false;
};

const router: Router = Router();

/**
 * Deliberately does not unsubscribe anyone. Corporate mail scanners follow
 * every link in a message before the recipient ever sees it, so a GET that
 * acted would unsubscribe people who never clicked. The button below posts.
 */
router.get(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    return res.send(
      await applyTemplate(
        {
          title: 'Unsubscribe',
          body: `
            <p style="margin: 0 0 20px;">Stop receiving these emails?</p>
            <form method="POST" action="${req.originalUrl}">
              <button type="submit" style="padding: 10px 32px; font-size: 14px; color: #ffffff; background-color: #5629b6; border: 0; border-radius: 300px; cursor: pointer;">
                Unsubscribe
              </button>
            </form>
          `,
        },
        'emailActionPage',
      ),
    );
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
      return res.status(400).send(
        await applyTemplate(
          {
            title: 'Unsubscribe',
            body: '<p style="margin: 0;">This link is invalid.</p>',
          },
          'emailActionPage',
        ),
      );
    }

    return res.send(
      await applyTemplate(
        {
          title: 'Unsubscribed',
          body: '<p style="margin: 0;">You will no longer receive these emails.</p>',
        },
        'emailActionPage',
      ),
    );
  }),
);

export { router };
