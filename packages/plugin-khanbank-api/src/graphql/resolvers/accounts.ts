import { IContext } from '../../connectionResolver';
import Khanbank from '../../khanbank/khanbank';

const KhanbankAccount = {
  async type(account: any, _params, {}) {
    switch (account.type) {
      case 'L':
        return 'Зээл';
      case 'D':
        return 'Дебит';

      default:
        break;
    }
  },

  async holderInfo(_account: any, params, { models }: IContext) {
    const { configId, accountNumber } = params;

    if (!configId || !accountNumber) {
      return null;
    }

    const config = await models.KhanbankConfigs.findOne({ _id: configId });

    if (!config) {
      return null;
    }

    const api = new Khanbank(config);

    try {
      const holderInfo = await api.accounts.getHolder(accountNumber, '050000');
      return holderInfo;
    } catch (_e) {
      return null;
    }
  }
};

export { KhanbankAccount };
