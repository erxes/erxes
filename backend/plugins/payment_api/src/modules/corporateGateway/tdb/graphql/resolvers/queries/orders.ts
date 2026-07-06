import { IContext } from '~/connectionResolvers';
import { OrdersApi } from '../../../api/orders';

const queries = {
  /**
   * Fetch a single TDB order by its order ID and the order password.
   * The order password is separate from the merchant credentials.
   */
  tdbOrder: async (
    _root: any,
    args: { configId: string; orderId: number; password: string },
    { models }: IContext,
  ) => {
    const config = await models.TdbConfigs.getConfig({ _id: args.configId });

    const ordersApi = new OrdersApi({
      apiUrl: config.apiUrl,
      username: config.username,
      password: config.password, // merchant credentials for basic auth (if needed elsewhere)
    });

    try {
      // The get method uses the order-specific password (not the merchant password)
      const detail = await ordersApi.get(args.orderId, args.password);
      return detail.order;
    } catch (e) {
      throw new Error(`Failed to fetch TDB order: ${e.message}`);
    }
  },
};

export default queries;