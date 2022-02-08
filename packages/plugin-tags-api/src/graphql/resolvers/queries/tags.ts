import { checkPermission, requireLogin } from "@erxes/api-utils/src/permissions";
import { IContext } from "@erxes/api-utils/src/types";
import { Tags } from "../../../models";

const tagQueries = {
  /**
   * Tags list
   */
  tags(
    _root,
    { type, searchValue }: { type: string; searchValue?: string },
    { commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector, type };

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return Tags.find(selector).sort({
      order: 1,
      name: 1
    });
  },

  /**
   * Get one tag
   */
  tagDetail(_root, { _id }: { _id: string }) {
    return Tags.findOne({ _id });
  }
};

requireLogin(tagQueries, 'tagDetail');
checkPermission(tagQueries, 'tags', 'showTags', []);

export default tagQueries;
