import { IContext } from "../../../connectionResolver";
import GolomtBank from "../../../golomtBank/golomtBank";

const queries = {
  async golomtBankAccounts(
    _root,
    { configId }: { configId: string },
    { models }: IContext
  ) {
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });
    if (!config) {
      throw new Error("Not found config");
    }
    const golomtBank = new GolomtBank(config);
    try {
      golomtBank.accounts.list();
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async golomtBankAccountDetail(
    _root,
    { configId, accountId }: { configId: string; accountId: string },
    { models }: IContext
  ) {
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });

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
    { models }: IContext
  ) {
    const { configId } = args;

    try {
      const config = await models.GolomtBankConfigs.getConfig({
        _id: configId,
      });
      if (!config) {
        throw new Error("Not found config");
      }
      // if (config.accountId !== args.accountId) {
      //   throw new Error('please check account number');
      // }
      const golomtBank = new GolomtBank(config);

      return await golomtBank.statements.list(args);
    } catch (e) {
      throw new Error(e.message);
    }
  },
  async golomtBankAccountBalance(
    _root,
    { configId, accountId }: { configId: string; accountId: string },
    { models }: IContext
  ) {
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });

    const golomtBank = new GolomtBank(config);
  
      const res = await golomtBank.accounts.getBalance(accountId);
      return  JSON.parse(res);
    
  },
};

export default queries;
