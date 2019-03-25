import { Forms } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

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

moduleRequireLogin(formQueries);

export default formQueries;
