import { IContext } from '@erxes/api-utils/src/types';
import { Accounts, Messages } from '../../../models';

const queries = {
  async golomtBankAccounts(_root, _args, _context: IContext) {
    return Accounts.getAccounts();
  },

  async getCheckBalance(_root, _args , _context: IContext) {
    return Accounts.getAccounts();
  },

  async getTransactionReceipt(_root, _args , _context: IContext) {
    return Accounts.getAccounts();
  },

  async getCheckAcntName(_root, _args , _context: IContext) {
    return Accounts.getAccounts();
  },
  
  async getAcntName(_root, _args , _context: IContext) {
    return Accounts.getAccounts();
  },
  async getTransactionRefenence(_root, _args , _context: IContext) {
    return Accounts.getAccounts();
  },
  async getAccountInfo(_root, _args , _context: IContext) {
    return Accounts.getAccounts();
  },
};

export default queries;
