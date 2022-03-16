import { checkPermission } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";

const formQueries = {
  /**
   * Forms list
   */
  forms(_root, _args, { commonQuerySelector, models }: IContext) {
    return models.Forms.find(commonQuerySelector).sort({ title: 1 });
  },

  /**
   * Get one form
   */
  formDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Forms.findOne({ _id });
  }
};

checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;
