import { ResponseTemplates } from '../../../db/models';

export default {
  /**
   * Create new response template
   * @return {Promise} response template object
   */
  responseTemplateAdd(root, { name, content, brandId, files }, { user }) {
    if (!user) throw new Error('Login required');

    return ResponseTemplates.create({ name, content, brandId, files });
  },

  /**
   * Update response template
   * @return {Promise} response template object
   */
  async responseTemplateEdit(root, { _id, name, content, brandId, files }, { user }) {
    if (!user) throw new Error('Login required');

    await ResponseTemplates.update({ _id }, { name, content, brandId, files });
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
      throw new Error('Response template not found with id ' + _id);
    }
    return responseTemplateObj.remove();
  },
};
