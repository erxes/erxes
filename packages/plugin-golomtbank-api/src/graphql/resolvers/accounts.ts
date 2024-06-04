import { IContext } from '../../connectionResolver';
import GolomtBank from '../../golomtBank/golomtBank';

const GolomtBankAccount = {
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

    const config = await models.GolomtBankConfigs.findOne({ _id: configId });

    if (!config) {
      return null;
    }

    const api = new GolomtBank(config);

    try {
      const holderInfo = await api.accounts.getHolder(accountNumber, '050000');
      return holderInfo;
    } catch (_e) {
      return null;
    }
  }
};

export { GolomtBankAccount };
