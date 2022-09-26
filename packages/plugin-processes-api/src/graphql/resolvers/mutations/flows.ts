// import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { IFlow } from '../../../models/definitions/flows';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IFlowsEdit extends IFlow {
  _id: string;
}

const flowMutations = {
  /**
   * Creates a new flow
   * @param {Object} doc Product document
   */
  async flowsAdd(
    _root,
    doc: IFlow,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const flow = await models.Flows.createFlow(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT,
        newData: {
          ...doc,
          categoryId: flow.categoryId
        },
        object: flow
      },
      user
    );

    return flow;
  },

  /**
   * Edits a flow
   * @param {string} param2._id Product id
   * @param {Object} param2.doc Product info
   */
  async flowsEdit(
    _root,
    { _id, ...doc }: IFlowsEdit,
    { user, models, subdomain }: IContext
  ) {
    const flow = await models.Flows.getFlow(_id);
    const updated = await models.Flows.updateFlow(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT,
        object: flow,
        newData: { ...doc },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a flow
   * @param {string} param1._id Product id
   */
  async flowsRemove(
    _root,
    { flowIds }: { flowIds: [string] },
    { user, models, subdomain }: IContext
  ) {
    const flows = await models.Flows.find({
      _id: { $in: flowIds }
    }).lean();

    const response = await models.Flows.removeFlows(flowIds);

    for (const flow of flows) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.PRODUCT, object: flow },
        user
      );
    }

    return response;
  }
};

// moduleCheckPermission(flowMutations, 'manageJobs');

export default flowMutations;
