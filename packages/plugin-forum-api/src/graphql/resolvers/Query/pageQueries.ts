import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const pageQueries: IObjectTypeResolver<any, IContext> = {
  forumPage(_, { _id }, { models: { Page } }) {
    return Page.findByIdOrThrow(_id);
  },
  forumPages(_, params, { models: { Page } }) {
    const { code, customQuery = {}, sort = {}, limit = 0, offset = 0 } = params;

    const query: any = {};

    if (code?.length) {
      query.code = { $in: code };
    }

    const finalQuery = { ...query, ...customQuery };

    return Page.find(finalQuery)
      .skip(offset)
      .limit(limit)
      .sort(sort);
  }
};

export default pageQueries;
