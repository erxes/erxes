import { requireLogin } from '@erxes/api-utils/src/permissions';
import { Tradings, ITrading } from '../../models';
import { prisma } from '../../database';
const tradingMutations = {
  /**
   * Creates a new trading
   */
  async tradingsAdd(_root, doc: ITrading) {
    const trading = await Tradings.createTrading(doc);

    return trading;
  },
  async tradingsWalletAdd(parent, args) {
    return prisma.wallet.create({
      data: {
        currencyCode: args.currencyCode,
        userId: args.userId,
        status: args.status,
        name: args.name,
        type: args.type,
        walletNumber: args.walletNumber
      }
    });
  }
};

//requireLogin(tradingMutations, 'tradingsAdd');

export default tradingMutations;
