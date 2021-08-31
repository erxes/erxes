import { Segments } from '../../../db/models';
import { ICondition, ISegment } from '../../../db/models/definitions/segments';
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

    if (
      extendedDoc.conditionSegments &&
      extendedDoc.conditionSegments.length > 0
    ) {
      const subSegments = extendedDoc.conditionSegments;
      extendedDoc.conditions = [];

      await Promise.all(
        subSegments.map(async subSegment => {
          const item = await Segments.createSegment(subSegment);

          extendedDoc.conditions.push({
            subSegmentId: item._id,
            type: 'subSegment'
          });
        })
      );
    }

    const segment = await Segments.createSegment(extendedDoc);

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

    if (doc.conditionSegments && doc.conditionSegments.length > 0) {
      const subSegments = doc.conditionSegments;
      const updatedSubSugments: ICondition[] = [];

      await Promise.all(
        subSegments.map(async subSegment => {
          if (subSegment._id) {
            updatedSubSugments.push({
              subSegmentId: subSegment._id,
              type: 'subSegment'
            });
            await Segments.updateSegment(subSegment._id, subSegment);
          } else {
            const item = await Segments.createSegment(subSegment);

            updatedSubSugments.push({
              subSegmentId: item._id,
              type: 'subSegment'
            });
          }
        })
      );

      doc.conditions = updatedSubSugments;
    }

    const updated = await Segments.updateSegment(_id, doc);

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
