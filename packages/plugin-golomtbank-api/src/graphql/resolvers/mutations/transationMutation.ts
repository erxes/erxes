import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IGolomtBankConfig } from '../../../models/definitions/golomtBankConfigs'
import { IContext } from '../../../connectionResolver';
import { getAuthHeaders } from '../../../utils/utils';
import { IGolomtBankTransation } from '../../../models/definitions/golomtBankTransaction';


const mutations = {
  async createGolomtBankTransaction(_root, transactionRequest: IGolomtBankTransation, { models }: IContext) {
    try {
      return models.GolomtBankTransaction.createTransaction(transactionRequest);
    } catch (e) {
      throw new Error('голомт банкны гүйлгээний хүсэлт хадгалахад алдаа гарлаа');
    }
  },
 
};

requireLogin(mutations, 'createGolomtBankTransaction');

checkPermission(mutations, 'createGolomtBankTransaction', 'createGolomtBankTransaction', []);


export default mutations;
