import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const queries = {
  /**
   * Cms categories list
   */
  async cmsCategories(
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> {
    const { models } = context;
    const {
      searchValue,
      status,
    } = args;
    const clientPortalId = args.clientPortalId || context.clientPortalId;
    const query = {
      clientPortalId,
      ...(status && { status }),
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Categories,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
    const { models, clientPortalId } = context;
    const { _id, slug } = args;

    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.Categories.findOne({ slug, clientPortalId });
    }

    return models.Categories.findOne({ _id });
  },
};

export default queries;
