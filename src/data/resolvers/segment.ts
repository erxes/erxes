import { Segments } from '../../db/models';
import { ISegmentDocument } from '../../db/models/definitions/segments';

export default {
  getSubSegments(segment: ISegmentDocument) {
    return Segments.find({ subOf: segment._id });
  },
};
