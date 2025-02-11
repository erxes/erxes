import { IContext } from '../../connectionResolver';
import { ISectionDocument } from '../../db/models/definitions/insight';

export default {
  async list(section: ISectionDocument, {}, { models, user }: IContext) {
    try {
      const { _id, type } = section;

      if (type === 'dashboard') {
        return models.Dashboards.getDashboards({ sectionId: _id }, user);
      }

      if (type === 'report') {
        return models.Reports.getReports({ sectionId: _id }, user);
      }
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async listCount(section: ISectionDocument, {}, { models, user }: IContext) {
    try {
      const { _id, type } = section;

      if (type === 'dashboard') {
        return models.Dashboards.getDashboardsCount({ sectionId: _id }, user);
      }

      if (type === 'report') {
        return models.Reports.getReportsCount({ sectionId: _id }, user);
      }
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async createdBy(section: ISectionDocument, _params, { models }: IContext) {
    return models.Users.findOne({ _id: section.createdBy });
  },
  async updatedBy(section: ISectionDocument, _params, { models }: IContext) {
    return models.Users.findOne({ _id: section.updatedBy });
  },
};
