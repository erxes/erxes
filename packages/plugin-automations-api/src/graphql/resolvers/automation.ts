import { Users } from "../../apiCollections";
import { IAutomationDoc } from '../../models/definitions/automaions';

export default {
  createdUser(automation: IAutomationDoc) {
    return Users.findOne({ _id: automation.createdBy });
  },

  updatedUser(automation: IAutomationDoc) {
    return Users.findOne({ _id: automation.updatedBy });
  }
};
