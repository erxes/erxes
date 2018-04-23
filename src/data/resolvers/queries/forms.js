import { Forms } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
const formQueries = {
  /**
   * Forms list
   * @param {Object} args - Search params
   * @param {String} args.tag - Tag id to filter
   * @return {Promise} sorted forms list
   */
  async forms() {
    const forms = Forms.find({});

    return forms.sort({ title: 1 });
  },

  /**
   * Get one form
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found form
   */
  formDetail(root, { _id }) {
    return Forms.findOne({ _id });
  },
};

moduleRequireLogin(formQueries);

export default formQueries;
