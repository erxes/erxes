import { FlowActions } from '../../../db/models';
import { IFlowAction } from '../../../db/models/definitions/flowActions';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IFlowActionsEdit extends IFlowAction {
  _id: string;
}

const flowActionMutations = {
  /**
   * Create new flowAction
   */
  async flowActionsAdd(_root, doc: IFlowAction, { user }: IContext) {
    const flowAction = await FlowActions.createFlowAction({ ...doc });

    await putCreateLog(
      {
        type: MODULE_NAMES.FLOW_ACTION,
        newData: { ...doc, userId: user._id },
        object: flowAction,
      },
      user,
    );

    return flowAction;
  },

  /**
   * Update flowAction
   */
  async flowActionsEdit(_root, { _id, ...fields }: IFlowActionsEdit, { user }: IContext) {
    const flowAction = await FlowActions.getFlowAction(_id);
    const updated = await FlowActions.updateFlowAction(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.FLOW_ACTION,
        object: flowAction,
        newData: fields,
      },
      user,
    );

    return updated;
  },

  /**
   * Delete flowAction
   */
  async flowActionsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const flowAction = await FlowActions.getFlowAction(_id);
    const removed = await FlowActions.removeFlowAction(_id);

    await putDeleteLog({ type: MODULE_NAMES.FLOW_ACTION, object: flowAction }, user);

    return removed;
  },
};

moduleCheckPermission(flowActionMutations, 'manageFlowActions');

export default flowActionMutations;
