import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { putCreateLog, MODULE_NAMES } from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IWork } from '../../../models/definitions/works';

const performMutations = {
  /**
   * Creates a new flow
   * @param {Object} doc Product document
   */
  async worksAdd(
    _root,
    doc: IWork,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const perform = await models.Performs.createPerform(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PERFORM,
        newData: {
          ...doc
        },
        object: perform
      },
      user
    );

    return perform;
  }
};

// moduleCheckPermission(workMutations, 'manageWorks');

export default performMutations;
