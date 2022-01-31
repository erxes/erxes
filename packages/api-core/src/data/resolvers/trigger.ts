import { Segments } from '../../db/models';
import { fetchSegment } from '../modules/segments/queryBuilder';

export default {
  async count(trigger) {
    const contentId = trigger.config.contentId;

    try {
      const segment = await Segments.getSegment(contentId);
      const result = await fetchSegment(segment, { returnCount: true });
      return result;
    } catch {
      return 0;
    }
  }
};
