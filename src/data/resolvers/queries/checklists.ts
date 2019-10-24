import { Checklists } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';

const checklistQueries = {
  /**
   * Checklists list
   */
  async checklists(_root, { contentType, contentTypeId }: { contentType: string; contentTypeId: string }) {
    return Checklists.find({ contentType, contentTypeId }).sort({
      createdDate: 1,
    });
  },

  /**
   * Checklist
   */
  async checklistDetail(_root, { _id }: { _id: string }) {
    return Checklists.findOne({ _id });
  },
};

moduleRequireLogin(checklistQueries);

export default checklistQueries;
