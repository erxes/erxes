import { ISectionDocument } from './../../../models/definitions/insight';
import { IContext } from '../../../connectionResolver';

export default {
  async list(
    section: ISectionDocument,
    {},
    { models, subdomain }: IContext,
    { queryParams },
  ) {
    try {
      const { _id, type } = section;

      if (type === 'dashboard') {
        return models.Dashboards.find({ sectionId: _id });
      }

      if (type === 'report') {
        return models.Reports.find({ sectionId: _id });

      }
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  async listCount(
    section: ISectionDocument,
    {},
    { models, subdomain }: IContext,
  ) {
    try {
      const { _id, type } = section;

      if (type === 'dashboard') {
        return models.Dashboards.find({ sectionId: _id }).countDocuments();
      }

      if (type === 'report') {
        return models.Reports.find({ sectionId: _id }).countDocuments();
      }
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  createdBy(section: ISectionDocument) {
    return (
      section.createdBy && {
        __typename: 'User',
        _id: section.createdBy,
      }
    );
  },
  updatedBy(section: ISectionDocument) {
    return (
      section.updatedBy && {
        __typename: 'User',
        _id: section.updatedBy,
      }
    );
  },
};
