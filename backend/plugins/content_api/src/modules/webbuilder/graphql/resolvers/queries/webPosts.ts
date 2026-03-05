import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { getQueryBuilder } from '@/cms/utils/query-builders';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class WebPostQueryResolver extends BaseQueryResolver {
  async webPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, webId } = args;
    const { models } = context;

    if (!webId) throw new Error('webId is required');

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId: null });
    query.webId = webId;

    const { list } = await this.getListWithTranslations(
      models.WebPosts,
      query,
      { ...args, clientPortalId: null, language },
      FIELD_MAPPINGS.POST,
    );

    return list;
  }

  async webPost(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, slug, language, webId } = args;

    if (!_id && !slug) {
      return null;
    }

    if (!webId) throw new Error('webId is required');

    let query: any = { webId };
    if (slug) {
      query = { slug, webId };
    } else if (_id) {
      query = { _id, webId };
    }

    return this.getItemWithTranslation(
      models.WebPosts,
      query,
      language,
      FIELD_MAPPINGS.POST,
    );
  }

  async webPostList(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, webId } = args;
    const { models } = context;

    if (!webId) throw new Error('webId is required');

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId: null });
    query.webId = webId;

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.WebPosts,
      query,
      { ...args, clientPortalId: null, language },
      FIELD_MAPPINGS.POST,
    );

    return { posts: list, totalCount, pageInfo };
  }

  async webTranslations(_parent: any, args: any, context: IContext): Promise<any> {
    const { postId } = args;
    const { models } = context;
    return models.Translations.find({ postId });
  }

  async cpWebPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const { models, clientPortal } = context;

    if (!clientPortal) {
      throw new Error('Client portal required');
    }

    const web = await models.Web.findOne({ clientPortalId: clientPortal._id });

    if (!web) {
      throw new Error('Web not found for this client portal');
    }

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId: null });
    query.webId = web._id;

    const { list } = await this.getListWithTranslations(
      models.WebPosts,
      query,
      { ...args, clientPortalId: null, language },
      FIELD_MAPPINGS.POST,
    );

    return list;
  }

  async cpWebPostList(_parent: any, args: any, context: IContext): Promise<any> {
    const { language } = args;
    const { models, clientPortal } = context;

    if (!clientPortal) {
      throw new Error('Client portal required');
    }

    const web = await models.Web.findOne({ clientPortalId: clientPortal._id });

    if (!web) {
      throw new Error('Web not found for this client portal');
    }

    const queryBuilder = getQueryBuilder('post', models);
    const query = await queryBuilder.buildQuery({ ...args, clientPortalId: null });
    query.webId = web._id;

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.WebPosts,
      query,
      { ...args, clientPortalId: null, language },
      FIELD_MAPPINGS.POST,
    );

    return { posts: list, totalCount, pageInfo };
  }

  async cpWebPost(_parent: any, args: any, context: IContext): Promise<any> {
    const { models, clientPortal } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    if (!clientPortal) {
      throw new Error('Client portal required');
    }

    const web = await models.Web.findOne({ clientPortalId: clientPortal._id });

    if (!web) {
      throw new Error('Web not found for this client portal');
    }

    let query: any = { webId: web._id };

    if (slug) {
      query = { slug, webId: web._id };
    } else if (_id) {
      query = { _id, webId: web._id };
    }

    return this.getItemWithTranslation(
      models.WebPosts,
      query,
      language,
      FIELD_MAPPINGS.POST,
    );
  }
}

export const webPostQueries: Record<string, Resolver> = {
  // internal helpers (not exposed directly in schema, used by cp resolvers)
  cpWebPosts: (_parent: any, args: any, context: IContext) => {
    return new WebPostQueryResolver(context).cpWebPosts(_parent, args, context);
  },
  cpWebPostList: (_parent: any, args: any, context: IContext) => {
    return new WebPostQueryResolver(context).cpWebPostList(_parent, args, context);
  },
  cpWebPost: (_parent: any, args: any, context: IContext) => {
    return new WebPostQueryResolver(context).cpWebPost(_parent, args, context);
  },
  cpWebTranslations: (_parent: any, args: any, context: IContext) => {
    return new WebPostQueryResolver(context).webTranslations(
      _parent,
      args,
      context,
    );
  },
};

webPostQueries.cpWebPosts.wrapperConfig = {
  forClientPortal: true,
};

webPostQueries.cpWebPostList.wrapperConfig = {
  forClientPortal: true,
};

webPostQueries.cpWebPost.wrapperConfig = {
  forClientPortal: true,
};

webPostQueries.cpWebTranslations.wrapperConfig = {
  forClientPortal: true,
};
