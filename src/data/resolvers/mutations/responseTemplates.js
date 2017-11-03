import { ResponseTemplates } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const responseTemplateMutations = {
  /**
   * Create new response template
   * @param {Object} fields - response template fields
   * @return {Promise} newly created response template object
   */
  responseTemplatesAdd(root, doc) {
    return ResponseTemplates.create(doc);
  },

  /**
   * Update response template
   * @param {String} _id - response template id
   * @param {Object} fields - response template fields
   * @return {Promise} updated response template object
   */
  responseTemplatesEdit(root, { _id, ...fields }) {
    return ResponseTemplates.updateResponseTemplate(_id, fields);
  },

  /**
   * Delete response template
   * @param {String} _id - response template id
   * @return {Promise}
   */
  responseTemplatesRemove(root, { _id }) {
    return ResponseTemplates.removeResponseTemplate(_id);
  },
};

moduleRequireLogin(responseTemplateMutations);

export default responseTemplateMutations;
