import { ISegmentDocument } from '../../db/models/definitions/segments';
import { IContext } from '../types';

export default {
  getSubSegments(segment: ISegmentDocument, _, { dataLoaders }: IContext) {
    return dataLoaders.segmentsBySubOf.load(segment._id);
  }
};
