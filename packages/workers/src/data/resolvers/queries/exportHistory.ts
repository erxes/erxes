import { paginate } from '../../utils';
import { IContext } from '../../../connectionResolvers';

const exportHistoryQueries = {
  /**
   * Export history list
   */
  async exportHistories(
    _root,
    { type, ...args }: { page: number; perPage: number; type: string },
    { models }: IContext
  ) {
    const filter: { [key: string]: any } = {};

    if (type) {
      filter.contentType = type;
    }

    const list = await paginate(models.ExportHistory.find(filter), args).sort({
      date: -1
    });

    const count = models.ExportHistory.find(filter).countDocuments();

    return { list, count };
  }
};

export default exportHistoryQueries;
