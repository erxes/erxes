import { AutomationProducers } from 'erxes-api-shared/core-modules';

export const scoreAutomationProducers: AutomationProducers = {
  receiveActions: async ({ data }, { subdomain }) => {
    // const result =  await addScore({
    //   models,
    //   subdomain,
    //   serviceName,
    //   contentType,
    //   execution,
    //   config,
    // });
    return { result: null };
  },
};
