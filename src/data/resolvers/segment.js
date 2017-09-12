import { Segments } from '../../db/models';

export default {
  getParentSegment(segment) {
    return Segments.findOne(segment.subOf);
  },

  getSubSegments(segment) {
    return Segments.find({ subOf: segment._id });
  },
};
