import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const engageMutations = {
  /**
   * Create new message
   */
  async exmsAdd(_root, doc: any, { user, models }: IContext) {
    const exm = await models.Exms.createExm(doc, user);

    return exm;
  }
};

checkPermission(engageMutations, 'engageMessageEdit', 'engageMessageEdit');

export default engageMutations;
