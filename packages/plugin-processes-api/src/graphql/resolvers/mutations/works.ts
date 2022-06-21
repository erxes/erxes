import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { putCreateLog, MODULE_NAMES } from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IWork } from '../../../models/definitions/works';

const workMutations = {
  /**
   * Creates a new flow
   * @param {Object} doc Product document
   */
  async worksAdd(
    _root,
    doc: IWork,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const work = await models.Works.createWork(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.WORK,
        newData: {
          ...doc
        },
        object: work
      },
      user
    );

    return work;
  }
};

moduleCheckPermission(workMutations, 'manageWorks');

export default workMutations;
