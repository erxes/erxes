import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';

export const setupMessageConsumers = async () => {
  consumeQueue('cms:addPages', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { clientPortalId, kind, createdUserId } = data;
    const defaultPages = ['home', 'about', 'contact', 'privacy', 'terms'];
    const tourPages = [
      'tours',
      'tour',
      'checkout',
      'confirmation',
      'profile',
      'login',
      'register',
    ];

    const ecommercePages = [
      'products',
      'product',
      'checkout',
      'profile',
      'confirmation',
      'login',
      'register',
    ];

    const commerceKinds = ['ecommerce', 'restaurant', 'hotel'];

    const bulk: any[] = defaultPages.map((page) => ({
      createdUserId,
      clientPortalId,
      name: page,
      slug: page,
      pageItems: [],
    }));

    if (kind === 'tour') {
      tourPages.forEach((page) => {
        bulk.push({
          createdUserId,
          clientPortalId,
          name: page,
          slug: page,
          pageItems: [],
        });
      });
    }

    if (commerceKinds.includes(kind)) {
      ecommercePages.forEach((page) => {
        bulk.push({
          createdUserId,
          clientPortalId,
          name: page,
          slug: page,
          pageItems: [],
        });
      });
    }

    models.Pages.create(bulk);

    return {
      status: 'success',
    };
  });

  consumeQueue('cms:removePages', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    await models.Pages.deleteMany(data);
    return {
      status: 'success',
    };
  });

  consumeRPCQueue('cms:find', async ({ data }) => {
    return {
      status: 'success',
      // data: await Cmss.find({})
    };
  });
};
