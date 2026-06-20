import { IContext } from '~/connectionResolvers';
import { OrdersApi } from '../../../api/orders';
import { TdbOrderInput } from '../../../@types/tdb';

const mutations = {
  async tdbCreateOrder(
    _root,
    args: { configId: string; input: TdbOrderInput },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({ _id: args.configId });

    const ordersApi = new OrdersApi({
      apiUrl: config.apiUrl,
      username: config.username,
      password: config.password,
    });

    try {
      const response = await ordersApi.create(args.input);
      return response;
    } catch (e) {
      throw new Error(`Failed to create TDB order: ${e.message}`);
    }
  },
};


export default mutations;