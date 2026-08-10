import { IContext } from '~/connectionResolvers';
import GolomtBank from '../../../golomtBank/golomtBank';

const queries = {
  async golomtBankAccounts(
    _root,
    { configId }: { configId: string },
    { models }: IContext,
  ) {
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });

    if (!config) {
      throw new Error('Not found config');
    }

    const golomtBank = new GolomtBank(config);

    try {
      const res = await golomtBank.accounts.list();
      return JSON.parse(res);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async golomtBankAccountDetail(
    _root,
    { configId, accountId }: { configId: string; accountId: string },
    { models }: IContext,
  ) {
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });

    if (!config) {
      throw new Error('Not found config');
    }

    const golomtBank = new GolomtBank(config);

    const res = await golomtBank.accounts.get(accountId);
    return JSON.parse(res);
  },
  async golomtBankStatements(
    _root,
    args: {
      configId: string;
      accountId: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      perPage?: number;
    },
    { models }: IContext,
  ) {
    const { configId } = args;

    try {
      const config = await models.GolomtBankConfigs.getConfig({
        _id: configId,
      });
      if (!config) {
        throw new Error('Not found config');
      }

      const golomtBank = new GolomtBank(config);
      const res = await golomtBank.statements.list(args);
      return JSON.parse(res);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async golomtBankAccountBalance(
    _root,
    { configId, accountId }: { configId: string; accountId: string },
    { models }: IContext,
  ) {
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });

    if (!config) {
      throw new Error('Not found config');
    }
    const golomtBank = new GolomtBank(config);

    const res = await golomtBank.accounts.getBalance(accountId);
    return JSON.parse(res);
  },
};

export default queries;
