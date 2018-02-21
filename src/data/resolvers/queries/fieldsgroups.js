import { FieldsGroups } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const fieldsGroupQueries = {
  /**
   * Fields list
   * @param {String} contentType - Sort by content type
   * @param {Boolean} visibleOnly - Visible only fields
   *
   * @return {Promise} sorted fields group list
   */
  fieldsgroups(root, { contentType, visibleOnly }) {
    const query = {};

    // querying by content type
    if (contentType) {
      query.contentType = contentType;
    }

    // retreiving visible only groups
    if (visibleOnly) {
      query.visible = visibleOnly;
    }

    return FieldsGroups.find(query).sort({ order: 1 });
  },
};

moduleRequireLogin(fieldsGroupQueries);

export default fieldsGroupQueries;
