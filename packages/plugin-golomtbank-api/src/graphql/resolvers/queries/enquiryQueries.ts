
import { IContext } from '../../../connectionResolver';
import { Accounts, Messages } from '../../../models';
import { GolomtBank } from '../../../utils/golomtBankConnect'

const enquiryQueries = {

  //5004 

  async golomtStatements(
    _root,
    args: {
      configId: string;
      accountNumber: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      perPage?: number;
    },
    { models }: IContext
  ) {
    const { configId } = args;

    try {
      const config = await models.GolomtBankConfig.getConfig({_id: configId} );
      const statement = new GolomtBank(config);

      return await statement.statements.list(args);
    } catch (e) {
      throw new Error(e.message);
    }
  },
  async golomtBankAccounts(_root, args: {
    configId: string;
    accountNumber: string;
   
  },
  { models }: IContext) {

    const config = await models.GolomtBankConfig.getConfig({_id: args.configId} );
    const account = new GolomtBank(config);

    return account.getAccounts();
  },

  async getCheckBalance(_root, args: {
    configId: string;
    accountNumber: string;
    currency: string
  },
  { models }: IContext) {
    const config = await models.GolomtBankConfig.getConfig({_id: args.configId} );
    const balance = new GolomtBank(config);
    return balance.checkBalance({args});
  },

  async getTransactionReceipt(_root,
    args: {
      configId: string;
      accountNumber: string;
      tranId?: string;
      date: Date
    },
    { models }: IContext) {
    const config = await models.GolomtBankConfig.getConfig({_id: args.configId} );
    //img 5014
    const receipt = new GolomtBank(config);
    return receipt.getReceipt({args});
  },

  async getCheckAcntName(_root, _args , _context: IContext) {
    return Accounts.getAccounts();
  },
  
  async getTransactionRefenence(_root,
    args: {
      configId: string;
      accountNumber: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      perPage?: number;
    },
    { models }: IContext) {
      const config = await models.GolomtBankConfig.getConfig({_id: args.configId} );
      const refenence = new GolomtBank(config);
      return refenence.refenenceList({args});
  },
  async getAccountInfo( _root,
    args: {
      configId: string;
      accountNumber: string;
      FinId?: string;
    },
    { models }: IContext) {
      const config = await models.GolomtBankConfig.getConfig({_id: args.configId} );
      const info = new GolomtBank(config);
     
    return Accounts.acntInfo(args);
  },
  // async getAcntName(_root, _args , _context: IContext) {
  //   return Accounts.getAccounts();
  // },
};

export default enquiryQueries;
