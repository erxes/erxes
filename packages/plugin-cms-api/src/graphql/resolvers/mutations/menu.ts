import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const mutations = {
  cmsAddMenu(_parent: any, args: any, context: IContext) {
    const { models, clientPortalId } = context;
    const { input } = args;
    if (clientPortalId) {
      input.clientPortalId = clientPortalId;
    }

    return models.MenuItems.createMenuItem(input);
  },
  cmsEditMenu(_parent: any, args: any, context: IContext) {
    const { models,clientPortalId } = context;
    const { _id, input } = args;

    if (clientPortalId) {
      input.clientPortalId = clientPortalId;
    }

    return models.MenuItems.updateMenuItem(_id, input);
  },

  cmsRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    return models.MenuItems.deleteOne({ _id });
  },
};

requireLogin(mutations, 'cmsAddMenu');
requireLogin(mutations, 'cmsEditMenu');
requireLogin(mutations, 'cmsRemoveMenu');

checkPermission(mutations, 'cmsAddMenu', 'manageCms', []);
checkPermission(mutations, 'cmsEditMenu', 'manageCms', []);
checkPermission(mutations, 'cmsRemoveMenu', 'manageCms', []);

export default mutations;
