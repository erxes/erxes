import { Automations } from '../../../models';
import { IAutomation } from '../../../models/definitions/Automations';

const automationQueries = {
  /**
   * Automations list
   */
  async automations(_root, { filterDoc }: { filterDoc: IAutomation }) {
    return Automations.find({ ...filterDoc }).sort({
      createdDate: 1,
    });
  },

  /**
   * Automation
   */
  async automationDetail(_root, { _id }: { _id: string }) {
    return Automations.findOne({ _id });
  },
};

export default automationQueries;
