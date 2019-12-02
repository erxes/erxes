import { PipelineLabels } from '../../../db/models';
import { IPipelineLabel } from '../../../db/models/definitions/pipelineLabels';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IPipelineLabelsEdit extends IPipelineLabel {
  _id: string;
}

const pipelineLabelMutations = {
  /**
   * Create new pipeline label
   */
  async pipelineLabelsAdd(_root, { ...doc }: IPipelineLabel, { user }: IContext) {
    const pipelineLabel = await PipelineLabels.createPipelineLabel({ createdBy: user._id, ...doc });

    await putCreateLog(
      {
        type: 'pipelineLabel',
        newData: JSON.stringify(doc),
        description: `${doc.name} has been created`,
        object: pipelineLabel,
      },
      user,
    );

    return pipelineLabel;
  },

  /**
   * Edit pipeline label
   */
  async pipelineLabelsEdit(_root, { _id, ...doc }: IPipelineLabelsEdit, { user }: IContext) {
    const pipelineLabel = await PipelineLabels.getPipelineLabel(_id);

    const updated = await PipelineLabels.updatePipelineLabel(_id, doc);

    await putUpdateLog(
      {
        type: 'pipelineLabel',
        newData: JSON.stringify(doc),
        description: `${doc.name} has been edited`,
        object: pipelineLabel,
      },
      user,
    );

    return updated;
  },

  /**
   * Remove pipeline label
   */
  async pipelineLabelsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const pipelineLabel = await PipelineLabels.getPipelineLabel(_id);

    const removed = await PipelineLabels.removePipelineLabel(_id);

    await putDeleteLog(
      {
        type: 'pipelineLabel',
        object: pipelineLabel,
        description: `${pipelineLabel.name} has been removed`,
      },
      user,
    );

    return removed;
  },

  /**
   * Attach a label
   */
  pipelineLabelsLabel(
    _root,
    { pipelineId, targetId, labelIds }: { pipelineId: string; targetId: string; labelIds: string[] },
  ) {
    return PipelineLabels.labelsLabel(pipelineId, targetId, labelIds);
  },
};

export default pipelineLabelMutations;
