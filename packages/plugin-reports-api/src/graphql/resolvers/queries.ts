import { IContext } from '../../connectionResolver';

const reportsQueries = {
  reportsList(_root, {}, { models }: IContext) {
    const selector: any = {};
    const totalCount = models.Reports.count(selector);
    const list = models.Reports.find(selector).sort({ createdAt: 1, name: 1 });
    return { list, totalCount };
  },

  reportDetail(_root, { _id }, { models }: IContext) {
    return models.Reports.getReport(_id);
  },

  chartsList(_root, {}, { models }: IContext) {
    const selector: any = {};
    const totalCount = models.Charts.count(selector);
    const list = models.Charts.find(selector).sort({ name: 1 });
    return { list, totalCount };
  },

  chartDetail(_root, { _id }, { models }: IContext) {
    return models.Charts.getChart(_id);
  }
};

export default reportsQueries;
