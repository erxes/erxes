import { checkPermission } from "@erxes/api-utils/src/permissions";
import { IContext } from "@erxes/api-utils/src/types";
import { Forms } from "../../../models";

const formQueries = {
  /**
   * Forms list
   */
  forms(_root, _args, { commonQuerySelector }: IContext) {
    return Forms.find(commonQuerySelector).sort({ title: 1 });
  },

  /**
   * Get one form
   */
  formDetail(_root, { _id }: { _id: string }) {
    return Forms.findOne({ _id });
  }
};

checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;
