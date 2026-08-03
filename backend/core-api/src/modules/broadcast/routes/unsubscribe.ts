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

router.get(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    const params = new URLSearchParams();

    if (req.query.cid) {
      params.set('cid', String(req.query.cid));
    }

    if (req.query.uid) {
      params.set('uid', String(req.query.uid));
    }

    const action = `${req.baseUrl}${req.path}?${params.toString()}`;

    return res.send(
      await applyTemplate(
        {
          title: 'Unsubscribe',
          body: `
            <p style="margin: 0 0 20px;">Stop receiving these emails?</p>
            <form method="POST" action="${action}">
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
