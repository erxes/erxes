import { IContext } from '../../../connectionResolver';

const reportsQueries = {
  async reportList(_root, params, { models, user }: IContext) {
    const totalCount = await models.Reports.getReportsCount(params, user);

    const list = await models.Reports.getReports(params, user)

    return { list, totalCount };
  },

  async reportDetail(_root, { reportId }, { models }: IContext) {
    return models.Reports.getReport(reportId);
  },

  async reportsCountByTags(_root, _params, { models }: IContext) {
    const counts = {};

    const tags = await models.Tags.find({ type: 'reports:reports' });

    for (const tag of tags) {
      counts[tag._id] = await models.Reports.find({
        tagIds: tag._id,
        status: { $ne: 'deleted' },
      }).countDocuments();
    }

    return counts;
  },
};

export default reportsQueries;
