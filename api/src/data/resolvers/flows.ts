import { Integrations } from '../../db/models';
import { IFlowDocument } from '../../db/models/definitions/flows';

export default {
  integrations(flow: IFlowDocument) {
    return Integrations.findIntegrations({ flowId: flow._id });
  },
};
