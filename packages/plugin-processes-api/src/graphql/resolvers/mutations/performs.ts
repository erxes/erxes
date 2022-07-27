import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { putCreateLog, MODULE_NAMES } from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IPerform } from '../../../models/definitions/performs';

const performMutations = {
  /**
   * Creates a new flow
   * @param {Object} doc Product document
   */
  async performsAdd(
    _root,
    doc: IPerform,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const { needProducts, resultProducts, count } = doc;

    for (const need of needProducts) {
      const { quantity } = need;
      need.quantity = quantity * Number(count);
    }

    for (const result of resultProducts) {
      const { quantity } = result;
      result.quantity = quantity * Number(count);
    }

    const perform = await models.Performs.createPerform(docModifier(doc));

    console.log(perform);

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
