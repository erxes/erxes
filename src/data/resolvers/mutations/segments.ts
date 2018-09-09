import { Segments } from '../../../db/models';
import { ISegment } from '../../../db/models/definitions/segments';
import { moduleRequireLogin } from '../../permissions';

interface ISegmentsEdit extends ISegment {
  _id: string;
}

const segmentMutations = {
  /**
   * Create new segment
   */
  segmentsAdd(_root, doc: ISegment) {
    return Segments.createSegment(doc);
  },

  /**
   * Update segment
   */
  async segmentsEdit(_root, { _id, ...doc }: ISegmentsEdit) {
    return Segments.updateSegment(_id, doc);
  },

  /**
   * Delete segment
   */
  async segmentsRemove(_root, { _id }: { _id: string }) {
    return Segments.removeSegment(_id);
  },
};

moduleRequireLogin(segmentMutations);

export default segmentMutations;
