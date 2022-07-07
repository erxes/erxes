import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IPage, Pages } from '../../models';

const webbuilderMutations = {
  async webbuilderPagesAdd(_root, doc: IPage) {
    return Pages.createPage(doc);
  },

  async webbuilderPagesEdit(_root, args: { _id: string } & IPage) {
    const { _id, ...doc } = args;

    return Pages.updatePage(_id, doc);
  }
};

requireLogin(webbuilderMutations, 'webbuilderPagesAdd');
requireLogin(webbuilderMutations, 'webbuilderPagesEdit');

export default webbuilderMutations;
