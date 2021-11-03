import { Segments } from '../../../db/models';
import { ISegment } from '../../../db/models/definitions/segments';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { registerOnboardHistory } from '../../utils';

interface ISegmentsEdit extends ISegment {
  _id: string;
  conditionSegments: ISegment[];
}

const segmentMutations = {
  /**
   * Create new segment
   */
  async segmentsAdd(_root, doc: ISegment, { user, docModifier }: IContext) {
    const extendedDoc = docModifier(doc);

    const conditionSegments = extendedDoc.conditionSegments;

    const segment = await Segments.createSegment(
      extendedDoc,
      conditionSegments
    );

    if (doc.subOf) {
      registerOnboardHistory({ type: `subSegmentCreate`, user });
    }

    await putCreateLog(
      {
        type: MODULE_NAMES.SEGMENT,
        newData: doc,
        object: segment
      },
      user
    );

    return segment;
  },

  /**
   * Update segment
   */
  async segmentsEdit(
    _root,
    { _id, ...doc }: ISegmentsEdit,
    { user }: IContext
  ) {
    const segment = await Segments.getSegment(_id);
    const conditionSegments = doc.conditionSegments;

    const updated = await Segments.updateSegment(_id, doc, conditionSegments);

    await putUpdateLog(
      {
        type: MODULE_NAMES.SEGMENT,
        object: segment,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Delete segment
   */
  async segmentsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const segment = await Segments.getSegment(_id);
    const removed = await Segments.removeSegment(_id);

    await putDeleteLog({ type: MODULE_NAMES.SEGMENT, object: segment }, user);

    return removed;
  }
};

moduleCheckPermission(segmentMutations, 'manageSegments');

export default segmentMutations;
