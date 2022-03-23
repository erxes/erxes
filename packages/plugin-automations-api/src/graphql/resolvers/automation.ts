import { IContext } from "../../connectionResolver";
import { IAutomationDoc } from '../../models/definitions/automaions';

export default {
  createdUser(automation: IAutomationDoc, {}, { coreModels }: IContext) {
    return coreModels.Users.findOne({ _id: automation.createdBy });
  },

  updatedUser(automation: IAutomationDoc, {}, { coreModels }: IContext) {
    return coreModels.Users.findOne({ _id: automation.updatedBy });
  }
};
