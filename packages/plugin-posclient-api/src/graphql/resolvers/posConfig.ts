import { sendPosMessage } from '../../messageBroker';
import { IConfigDocument } from '../../models/definitions/configs';

export default {
  slots(config: IConfigDocument, _args, { subdomain }) {
    return (
      config.posId &&
      sendPosMessage({
        subdomain,
        action: 'findSlots',
        data: {
          posId: config.posId
        },
        isRPC: true
      })
    );
  }
};
