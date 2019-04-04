import { Forms } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions';

const formQueries = {
  /**
   * Forms list
   */
  forms() {
    return Forms.find({}).sort({ title: 1 });
  },

  /**
   * Get one form
   */
  formDetail(_root, { _id }: { _id: string }) {
    return Forms.findOne({ _id });
  },
};

requireLogin(formQueries, 'formDetail');
checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;
