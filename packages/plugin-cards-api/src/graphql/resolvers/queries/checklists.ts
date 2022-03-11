import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const checklistQueries = {
  /**
   * Checklists list
   */
  async checklists(
    _root,
    {
      contentType,
      contentTypeId,
    }: { contentType: string; contentTypeId: string },
    { models: { Checklists } }: IContext
  ) {
    return Checklists.find({ contentType, contentTypeId }).sort({
      createdDate: 1,
      order: 1,
    });
  },

  /**
   * Checklist
   */
  async checklistDetail(_root, { _id }: { _id: string }, { models: { Checklists } }: IContext) {
    return Checklists.findOne({ _id }).sort({ order: 1 });
  },
};

moduleRequireLogin(checklistQueries);

export default checklistQueries;
