import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';
import { queryBuilder } from './graphql/resolvers/queries/post';
import { paginate } from '@erxes/api-utils/src';

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

  consumeRPCQueue('cms:addPost', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    const post = await models.Posts.createPost(data);
    return {
      status: 'success',
      data: post,
    };
  });

  consumeRPCQueue('cms:editPost', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);
    const { _id, ...rest } = data;
    const post = await models.Posts.updatePost(_id, rest);
    return {
      status: 'success',
      data: post,
    };
  });

  consumeRPCQueue('cms:deletePost', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);
    const post = await models.Posts.deletePost(data);
    return {
      status: 'success',
      data: post,
    };
  });

  consumeRPCQueue('cms:getPostsPaginated', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);
    const {
      page = 1,
      perPage = 20,
      sortField = 'publishedDate',
      sortDirection = 'desc',
    } = data;

    const query = queryBuilder(data);

    const totalCount = await models.Posts.find(query).countDocuments();

    const posts = await paginate(
      models.Posts.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    const totalPages = Math.ceil(totalCount / perPage);

    const result = { totalCount, totalPages, currentPage: page, posts };

    return {
      status: 'success',
      data: result,
    };
  });

  consumeRPCQueue('cms:getPost', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);
    const post = await models.Posts.findOne(data);
    return {
      status: 'success',
      data: post,
    };
  });
};
