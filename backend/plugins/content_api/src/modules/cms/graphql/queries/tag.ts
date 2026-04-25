import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class TagQueryResolver extends BaseQueryResolver {
  private buildTagQuery(args: any, context: IContext, forClientPortal = false) {
    const { searchValue, status } = args;
    const clientPortalId = forClientPortal
      ? context.clientPortal._id
      : args.clientPortalId;
    const query: any = {
      clientPortalId,
      ...(status && { status }),
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    return { query, clientPortalId };
  }

  async cmsTags(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { language } = args;
    const { query, clientPortalId } = this.buildTagQuery(args, context);

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.PostTags,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.TAG,
      'tag',
    );

    return { tags: list, totalCount, pageInfo };
  }

  async cmsTag(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, slug, language, clientPortalId } = args;

    if (!_id && !slug) return null;

    const query = slug
      ? { slug, ...(clientPortalId ? { clientPortalId } : {}) }
      : { _id };

    return this.getItemWithTranslation(
      models.PostTags,
      query,
      language,
      FIELD_MAPPINGS.TAG,
      clientPortalId,
      'tag',
    );
  }

  async cpCmsTags(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { language } = args;
    const { query, clientPortalId } = this.buildTagQuery(args, context, true);

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.PostTags,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.TAG,
      'tag',
    );

    return { tags: list, totalCount, pageInfo };
  }
}

export const contentCmsTagQueries: Record<string, Resolver> = {
  cmsTags: (_parent: any, args: any, context: IContext) =>
    new TagQueryResolver(context).cmsTags(_parent, args, context),
  cmsTag: (_parent: any, args: any, context: IContext) =>
    new TagQueryResolver(context).cmsTag(_parent, args, context),
  cpCmsTags: (_parent: any, args: any, context: IContext) =>
    new TagQueryResolver(context).cpCmsTags(_parent, args, context),
};

contentCmsTagQueries.cpCmsTags.wrapperConfig = {
  forClientPortal: true,
};
