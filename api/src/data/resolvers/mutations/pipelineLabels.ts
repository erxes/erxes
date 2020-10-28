import { PipelineLabels } from '../../../db/models';
import { IPipelineLabel } from '../../../db/models/definitions/pipelineLabels';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { IContext } from '../../types';

interface IPipelineLabelsEdit extends IPipelineLabel {
  _id: string;
}

const pipelineLabelMutations = {
  /**
   * Creates a new pipeline label
   */
  async pipelineLabelsAdd(
    _root,
    { ...doc }: IPipelineLabel,
    { user }: IContext
  ) {
    const pipelineLabel = await PipelineLabels.createPipelineLabel({
      createdBy: user._id,
      ...doc
    });

    await putCreateLog(
      {
        type: MODULE_NAMES.PIPELINE_LABEL,
        newData: {
          ...doc,
          createdBy: user._id,
          createdAt: pipelineLabel.createdAt
        },
        object: pipelineLabel
      },
      user
    );

    return pipelineLabel;
  },

  /**
   * Edit pipeline label
   */
  async pipelineLabelsEdit(
    _root,
    { _id, ...doc }: IPipelineLabelsEdit,
    { user }: IContext
  ) {
    const pipelineLabel = await PipelineLabels.getPipelineLabel(_id);
    const updated = await PipelineLabels.updatePipelineLabel(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.PIPELINE_LABEL,
        newData: doc,
        object: pipelineLabel
      },
      user
    );

    return updated;
  },

  /**
   * Remove pipeline label
   */
  async pipelineLabelsRemove(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const pipelineLabel = await PipelineLabels.getPipelineLabel(_id);
    const removed = await PipelineLabels.removePipelineLabel(_id);

    await putDeleteLog(
      { type: MODULE_NAMES.PIPELINE_LABEL, object: pipelineLabel },
      user
    );

    return removed;
  },

  /**
   * Attach a label
   */
  pipelineLabelsLabel(
    _root,
    {
      pipelineId,
      targetId,
      labelIds
    }: { pipelineId: string; targetId: string; labelIds: string[] }
  ) {
    return PipelineLabels.labelsLabel(pipelineId, targetId, labelIds);
  }
};

export default pipelineLabelMutations;
