import { ResponseTemplates } from '../../../db/models';

export default {
  /**
   * Create new response template
   * @return {Promise} response template object
   */
  responseTemplateAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return ResponseTemplates.create(doc);
  },

  /**
   * Update response template
   * @return {Promise} response template object
   */
  async responseTemplateEdit(root, { _id, ...fields }, { user }) {
    if (!user) throw new Error('Login required');

    await ResponseTemplates.update({ _id }, { $set: { ...fields } });
    return ResponseTemplates.findOne({ _id });
  },

  /**
   * Delete response template
   * @return {Promise}
   */
  async responseTemplateRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    const responseTemplateObj = await ResponseTemplates.findOne({ _id });

    if (!responseTemplateObj) {
      throw new Error(`Response template not found with id ${_id}`);
    }

    return responseTemplateObj.remove();
  },
};
