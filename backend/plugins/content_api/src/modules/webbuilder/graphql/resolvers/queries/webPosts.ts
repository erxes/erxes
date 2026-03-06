import { BaseQueryResolver, FIELD_MAPPINGS } from '~/modules/webbuilder/utils/base-resolvers';
import { getWebQueryBuilder } from '@/webbuilder/utils/query-builders';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class WebPostQueryResolver extends BaseQueryResolver {
  async cpWebPosts(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, webId } = args;
    const { models } = context;

    if (!webId) throw new Error('webId is required');

    const query = getWebQueryBuilder('post').buildQuery(args);

    const { list } = await this.getListWithTranslations(
      models.WebPosts,
      query,
      { ...args, language },
      FIELD_MAPPINGS.POST,
    );

    return list;
  }

  async cpWebPostList(_parent: any, args: any, context: IContext): Promise<any> {
    const { language, webId } = args;
    const { models } = context;

    if (!webId) throw new Error('webId is required');

    const query = getWebQueryBuilder('post').buildQuery(args);

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.WebPosts,
      query,
      { ...args, language },
      FIELD_MAPPINGS.POST,
    );

    return { posts: list, totalCount, pageInfo };
  }

  async cpWebPost(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, slug, language, webId } = args;

    if (!_id && !slug) return null;
    if (!webId) throw new Error('webId is required');

    let query: any = {};
    if (slug) query = { slug, webId };
    else query = { _id };

    return this.getItemWithTranslation(
      models.WebPosts,
      query,
      language,
      FIELD_MAPPINGS.POST,
    );
  }

  async cpWebTranslations(_parent: any, args: any, context: IContext): Promise<any> {
    const { postId } = args;
    const { models } = context;
    return models.Translations.find({ postId });
  }
}

export const webPostQueries: Record<string, Resolver> = {
  cpWebPosts: (_parent: any, args: any, context: IContext) =>
    new WebPostQueryResolver(context).cpWebPosts(_parent, args, context),
  cpWebPostList: (_parent: any, args: any, context: IContext) =>
    new WebPostQueryResolver(context).cpWebPostList(_parent, args, context),
  cpWebPost: (_parent: any, args: any, context: IContext) =>
    new WebPostQueryResolver(context).cpWebPost(_parent, args, context),
  cpWebTranslations: (_parent: any, args: any, context: IContext) =>
    new WebPostQueryResolver(context).cpWebTranslations(_parent, args, context),
};

webPostQueries.cpWebPosts.wrapperConfig = { forClientPortal: true };
webPostQueries.cpWebPostList.wrapperConfig = { forClientPortal: true };
webPostQueries.cpWebPost.wrapperConfig = { forClientPortal: true };
webPostQueries.cpWebTranslations.wrapperConfig = { forClientPortal: true };