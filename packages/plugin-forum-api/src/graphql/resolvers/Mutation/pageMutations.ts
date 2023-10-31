import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const pageMutations: IObjectTypeResolver<any, IContext> = {
  forumCreatePage(_, params, { models: { Page } }) {
    return Page.createPage(params);
  },
  forumPatchPage(_, params, { models: { Page } }) {
    const { _id, ...patch } = params;
    return Page.patchPage(_id, patch);
  },
  forumDeletePage(_, { _id }, { models: { Page } }) {
    return Page.deletePage(_id);
  }
};

moduleRequireLogin(pageMutations);

export default pageMutations;
