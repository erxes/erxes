// import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { putCreateLog, MODULE_NAMES } from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IOverallWork } from '../../../models/definitions/overallWorks';

const overallWorkMutations = {
  /**
   * Creates a new flow
   * @param {Object} doc Product document
   */
  async overallWorksAdd(
    _root,
    doc: IOverallWork,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const overallWork = await models.OverallWorks.createOverallWork(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.OVERALWORK,
        newData: {
          ...doc
        },
        object: overallWork
      },
      user
    );

    return overallWork;
  }
};

// moduleCheckPermission(overallWorkMutations, 'manageWorks');

export default overallWorkMutations;
