
import { IContext } from '../../../connectionResolver';
import GolomtBank from '../../../golomtBank/golomtBank';

const queries = {
  async golomtBankAccounts(
    _root,
    { configId }: { configId: string },
    { models }: IContext
  ) {
    
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });
    if (!config) {
      throw new Error('Not found config');
    }
    const golomtBank = new GolomtBank(config);
    // const  list =  [
    //   {
    //     "requestId": "cc65ebc637d04541a7e45d753aaddce2",
    //     "accountId": "1605242952",
    //     "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
    //     "shortName": "ОЧИР УНДРА",
    //     "currency": "USD",
    //     "branchId": "160",
    //     "isSocialPayConnected": "N",
    //     "accountType": {
    //       "schemeCode": "CA658",
    //       "schemeType": "SBA"
    //     }
    //   }
    // ]
   //const test = golomtBank.accounts.list();
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

    try {
      return golomtBank.accounts.get(accountId);
    } catch (e) {
      throw new Error(e.message);
    }
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
      const config = await models.GolomtBankConfigs.getConfig({ _id: configId });
      if (!config) {
        throw new Error('Not found config');
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
};

export default queries;
