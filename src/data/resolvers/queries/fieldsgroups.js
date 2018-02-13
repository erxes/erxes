import { FieldsGroups } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const fieldsGroupQueries = {
  /**
   * Fields list
   * @param {Object} args
   * @return {Promise} sorted fields list
   */
  fieldsgroups(root, { contentType }) {
    const query = {};

    if (contentType) {
      query.contentType = contentType;
    }

    return FieldsGroups.find(query).sort({ order: 1 });
  },
};

moduleRequireLogin(fieldsGroupQueries);

export default fieldsGroupQueries;
