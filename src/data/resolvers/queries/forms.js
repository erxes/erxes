import { Forms } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const formQueries = {
  /**
   * Get form's detail
   * @param {String} _id - Form id
   * @return {Promise} found form
   */
  formDetail(root, { _id }) {
    return Forms.findOne({ _id });
  },
};

moduleRequireLogin(formQueries);

export default formQueries;
