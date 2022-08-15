import { requireLogin } from '@erxes/api-utils/src/permissions';

import { Tradings } from '../../models';
import { prisma } from '../../database';

const tradingQueries = {
  tradings(_root) {
    return Tradings.find();
  },
  tradingsTotalCount(_root, _args) {
    return Tradings.find({}).countDocuments();
  },
  async tradingsWallets(_root, _args) {
    let data = await prisma.wallet.findMany({});
    console.log(data);
    return data._count;
  },
  async tradingsWalletCount(_root, _args) {
    let data = await prisma.wallet.aggregate({
      _count: true
    });
    console.log(data);
    return data._count;
  }
};

requireLogin(tradingQueries, 'tradings');
requireLogin(tradingQueries, 'tradingsTotalCount');

export default tradingQueries;
