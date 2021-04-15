import { Flows } from '../../../db/models';
import { IFlow } from '../../../db/models/definitions/flows';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IFlowsEdit extends IFlow {
  _id: string;
}

const flowMutations = {
  /**
   * Create new flow
   */
  async flowsAdd(_root, doc: IFlow, { user }: IContext) {
    const flow = await Flows.createFlow({ ...doc });

    await putCreateLog(
      {
        type: MODULE_NAMES.FLOW,
        newData: { ...doc, userId: user._id },
        object: flow,
      },
      user,
    );

    return flow;
  },

  /**
   * Update flow
   */
  async flowsEdit(_root, { _id, ...fields }: IFlowsEdit, { user }: IContext) {
    const flow = await Flows.getFlow(_id);
    const updated = await Flows.updateFlow(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.FLOW,
        object: flow,
        newData: fields,
      },
      user,
    );

    return updated;
  },

  /**
   * Delete flow
   */
  async flowsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const flow = await Flows.getFlow(_id);
    const removed = await Flows.removeFlow(_id);

    await putDeleteLog({ type: MODULE_NAMES.FLOW, object: flow }, user);

    return removed;
  },
  /**
   * Update flowId fields in given Integrations
   */
  async flowsManageIntegrations(_root, { _id, integrationIds }: { _id: string; integrationIds: string[] }) {
    return Flows.manageIntegrations({ _id, integrationIds });
  },
};

moduleCheckPermission(flowMutations, 'manageFlows');

export default flowMutations;
