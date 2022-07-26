import { sendPosMessage } from '../../../messageBroker';
import { IContext } from '../../types';
const PosSlotQueries = {
  async posClientPosSlots(_root, { subdomain }: IContext) {
    const posSlots = await sendPosMessage({
      subdomain,
      action: 'getData',
      data: { _id: '', code: '', name: '', posId: '' },
      isRPC: true
    });

    return posSlots;
  }
};

export default PosSlotQueries;
