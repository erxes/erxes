import { IContext } from '../../connectionResolver';
import { IAutomationDoc } from '../../models/definitions/automaions';

export default {
  createdUser(automation: IAutomationDoc) {
    return (
      automation.createdBy && {
        __typename: 'User',
        _id: automation.createdBy
      }
    );
  },

  updatedUser(automation: IAutomationDoc) {
    return (
      automation.updatedBy && {
        __typename: 'User',
        _id: automation.updatedBy
      }
    );
  },

  async tags(automation: IAutomationDoc) {
    return (automation.tagIds || []).map(_id => ({
      __typename: 'Tag',
      _id
    }));
  }
};
