import { IContext } from "@erxes/api-utils/src";


import GolomtBank from '../../../golomtBank/golomtBank'

const queries = {

  async golomtBankAccounts(
    _root,
    { configId }: { configId: string },
    { models }: any
  ) {
    const golomtbank =  new GolomtBank;

    try {
      return golomtbank.accounts.list();
    } catch (e) {
      throw new Error(e.message);
    }
  },

}

export default queries;

