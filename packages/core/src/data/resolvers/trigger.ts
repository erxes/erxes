import { fetchSegment } from "../../messageBroker";

export default {
  async count(trigger) {
    const contentId = trigger.config.contentId;

    try {
      const result = await fetchSegment(contentId, { returnCount: true });
      return result;
    } catch {
      return 0;
    }
  }
};
