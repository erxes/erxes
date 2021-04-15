import { FlowActionTypes } from '../../../db/models';
import { IFlowActionType } from '../../../db/models/definitions/flowActionTypes';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IFlowActionTypesEdit extends IFlowActionType {
  _id: string;
}

const flowActionTypeMutations = {
  /**
   * Create new flowActionType
   */
  async flowActionTypesAdd(_root, doc: IFlowActionType, { user }: IContext) {
    const flowActionType = await FlowActionTypes.createFlowActionType({ ...doc });

    await putCreateLog(
      {
        type: MODULE_NAMES.FLOW_ACTION_TYPE,
        newData: { ...doc, userId: user._id },
        object: flowActionType,
      },
      user,
    );

    return flowActionType;
  },

  /**
   * Update flowActionType
   */
  async flowActionTypesEdit(_root, { _id, ...fields }: IFlowActionTypesEdit, { user }: IContext) {
    const flowActionType = await FlowActionTypes.getFlowActionType(_id);
    const updated = await FlowActionTypes.updateFlowActionType(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.FLOW_ACTION_TYPE,
        object: flowActionType,
        newData: fields,
      },
      user,
    );

    return updated;
  },

  /**
   * Delete flowActionType
   */
  async flowActionTypesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const flowActionType = await FlowActionTypes.getFlowActionType(_id);
    const removed = await FlowActionTypes.removeFlowActionType(_id);

    await putDeleteLog({ type: MODULE_NAMES.FLOW_ACTION_TYPE, object: flowActionType }, user);

    return removed;
  },
};

moduleCheckPermission(flowActionTypeMutations, 'manageFlowActionTypes');

export default flowActionTypeMutations;
