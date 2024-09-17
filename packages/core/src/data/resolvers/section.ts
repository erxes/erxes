import { ISectionDocument } from "../../db/models/definitions/insight";
import { IContext } from "../../connectionResolver";

export default {
  async list(section: ISectionDocument, {}, { models }: IContext) {
    try {
      const { _id, type } = section;

      if (type === "dashboard") {
        return models.Dashboards.find({ sectionId: _id });
      }

      if (type === "report") {
        return models.Reports.find({ sectionId: _id });
      }
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async listCount(section: ISectionDocument, {}, { models }: IContext) {
    try {
      const { _id, type } = section;

      if (type === "dashboard") {
        return models.Dashboards.find({ sectionId: _id }).countDocuments();
      }

      if (type === "report") {
        return models.Reports.find({ sectionId: _id }).countDocuments();
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
  }
};
