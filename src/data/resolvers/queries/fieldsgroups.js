import { FieldsGroups } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../../constants';

const fieldsGroupQueries = {
  /**
   * Fields list
   * @param {String} contentType - Filter by content type
   *
   * @return {Promise} Filtered fields group list
   */
  fieldsGroups(root, { contentType }) {
    const query = {};

    // querying by content type
    query.contentType = contentType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER;

    return FieldsGroups.find(query).sort({ order: 1 });
  },
};

moduleRequireLogin(fieldsGroupQueries);

export default fieldsGroupQueries;
