import { IContext } from '~/connectionResolvers';

import {
  TdbDomesticTransferInput,
  TdbInterbankTransferInput,
} from '../../../@types/tdb';

import { TransfersApi } from '../../../api/transfers';

const mutations = {
  async tdbDomesticTransfer(
    _root,
    args: {
      configId: string;
      input: TdbDomesticTransferInput;
    },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({
      _id: args.configId,
    });

    const transfersApi = new TransfersApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return transfersApi.domestic(args.input);
  },

  async tdbInterbankTransfer(
    _root,
    args: {
      configId: string;
      input: TdbInterbankTransferInput;
    },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({
      _id: args.configId,
    });

    const transfersApi = new TransfersApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return transfersApi.interbank(args.input);
  },
};

export default mutations;