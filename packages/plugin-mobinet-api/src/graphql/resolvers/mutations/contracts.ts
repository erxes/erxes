import { IContext } from '../../../connectionResolver';
import { IContract } from '../../../models/definitions/contracts';

const mutations = {
  mobiContractsCreate: async (_root, doc: IContract, { models }: IContext) => {
    return models.Contracts.createContract(doc);
  }
};

export default mutations;
