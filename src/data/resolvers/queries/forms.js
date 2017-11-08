import { Forms } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const formQueries = {
  /**
   * Forms list
   * @param {Object} params - Search params
   * @return {Promise} sorted forms list
   */
  forms(root, { params = {} }) {
    const forms = paginate(Forms.find({}), params);
    return forms.sort({ name: 1 });
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

  /**
   * Get all forms count. We will use it in pager
   * @return {Promise} total count
   */
  formsTotalCount() {
    return Forms.find({}).count();
  },
};

moduleRequireLogin(formQueries);

export default formQueries;
