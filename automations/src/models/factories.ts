import * as faker from 'faker';
import Automations, { IAutomation } from './Automations';

export const automationFactory = async (params: IAutomation) => {
  const automation = new Automations({
    name: params.name || faker.random.word(),
    trigger: params.trigger || { type: 'webpageVisited' },
    actions: params.actions || [],
  });

  return automation.save();
};
