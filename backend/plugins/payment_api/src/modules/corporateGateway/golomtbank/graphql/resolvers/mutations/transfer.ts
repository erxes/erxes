import { IContext } from '~/connectionResolvers';
import GolomtBank from '../../../golomtBank/golomtBank';

const mutations = {
  golomtBankTransfer: async (
    _root,
    args: {
      configId: string;
      transfer: any;
    },
    { models }: IContext,
  ) => {
    const { configId, transfer } = args;
    const config = await models.GolomtBankConfigs.getConfig({
      _id: configId,
    });
    if (!config) {
      throw new Error('Not found config');
    }
    const golomtBank = new GolomtBank(config);
    return golomtBank.transfer.transfer(transfer, config.registerId);
  },
};
export default mutations;
