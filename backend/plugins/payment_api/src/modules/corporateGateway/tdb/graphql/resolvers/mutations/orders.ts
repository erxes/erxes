import { IContext } from '~/connectionResolvers';
import { OrdersApi } from '../../../api/orders';
import { TdbOrderInput } from '../../../@types/tdb';

const mutations = {
  async tdbCreateOrder(
    _root,
    args: {
      configId: string;
      input: TdbOrderInput;
    },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({
      _id: args.configId,
    });

    const ordersApi = new OrdersApi({
      apiUrl: config.apiUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    return ordersApi.create(args.input);
  },
};

export default mutations;
