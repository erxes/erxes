
import { IContext } from '../../../connectionResolver';
import GolomtBank from '../../../golomtBank/golomtBank';

const queries = {
  async golomtBankAccounts(
    _root,
    { configId }: { configId: string },
    { models }: IContext
  ) {
    // const config = await models.GolomtBankConfigs.getConfig({ _id: configId });
    // const golomtBank = new GolomtBank(config);
    const  list =  [
      {
        "requestId": "cc65ebc637d04541a7e45d753aaddce2",
        "accountId": "1605242952",
        "accountName": "ОЧИР УНДРАА ОМЗ ББСБ",
        "shortName": "ОЧИР УНДРА",
        "currency": "USD",
        "branchId": "160",
        "isSocialPayConnected": "N",
        "accountType": {
          "schemeCode": "CA658",
          "schemeType": "SBA"
        }
      }
    ]
    try {
      return list
      // return golomtBank.accounts.list();
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async golomtBankAccountDetail(
    _root,
    { configId, accountNumber }: { configId: string; accountNumber: string },
    { models }: IContext
  ) {
    const config = await models.GolomtBankConfigs.getConfig({ _id: configId });

    const golomtBank = new GolomtBank(config);

    try {
      return golomtBank.accounts.get(accountNumber);
    } catch (e) {
      throw new Error(e.message);
    }
  },
};

export default queries;
