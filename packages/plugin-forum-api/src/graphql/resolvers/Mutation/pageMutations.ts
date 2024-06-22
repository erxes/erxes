import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const pageMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreatePage(_, params, { models: { Page } }) {
    return Page.createPage(params);
  },
  async forumPatchPage(_, params, { models: { Page } }) {
    const { _id, ...patch } = params;
    return Page.patchPage(_id, patch);
  },
  async forumDeletePage(_, { _id }, { models: { Page } }) {
    return Page.deletePage(_id);
  }
};

moduleRequireLogin(pageMutations);

export default pageMutations;
