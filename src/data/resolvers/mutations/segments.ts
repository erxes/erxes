import { Segments } from '../../../db/models';
import { ISegment } from '../../../db/models/definitions/segments';
import { IUserDocument } from '../../../db/models/definitions/users';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface ISegmentsEdit extends ISegment {
  _id: string;
}

const segmentMutations = {
  /**
   * Create new segment
   */
  async segmentsAdd(_root, doc: ISegment, { user }: { user: IUserDocument }) {
    const segment = await Segments.createSegment(doc);

    if (segment) {
      await putCreateLog(
        {
          type: 'segment',
          newData: JSON.stringify(doc),
          object: segment,
          description: `${segment.name} has been created`,
        },
        user,
      );
    }

    return segment;
  },

  /**
   * Update segment
   */
  async segmentsEdit(_root, { _id, ...doc }: ISegmentsEdit, { user }: { user: IUserDocument }) {
    const segment = await Segments.findOne({ _id });
    const updated = await Segments.updateSegment(_id, doc);

    if (segment) {
      await putUpdateLog(
        {
          type: 'segment',
          object: segment,
          newData: JSON.stringify(doc),
          description: `${segment.name} has been edited`,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Delete segment
   */
  async segmentsRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const segment = await Segments.findOne({ _id });
    const removed = await Segments.removeSegment(_id);

    if (segment) {
      await putDeleteLog(
        {
          type: 'segment',
          object: segment,
          description: `${segment.name} has been removed`,
        },
        user,
      );
    }

    return removed;
  },
};

moduleCheckPermission(segmentMutations, 'manageSegments');

export default segmentMutations;
