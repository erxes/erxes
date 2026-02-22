import { IContext } from '~/connectionResolvers';
import Khanbank from '../../../khanbank/khanbank';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';

const mutations = {
  khanbankTransfer: async (
    _root,
    args: { configId: string; transfer: any },
    { models }: IContext,
  ) => {
    const { transfer } = args;

    const config = await models.KhanbankConfigs.getConfig({
      _id: args.configId,
    });

    const khanbank = new Khanbank(config);

    if (transfer.type === 'interbank') {
      return khanbank.transfer.interbank(transfer);
    }

    return khanbank.transfer.domestic(transfer);
  },
};
requireLogin(mutations, 'khanbankTransfer');
checkPermission(mutations, 'khanbankTransfer', 'khanbankTransfer', []);
export default mutations;
