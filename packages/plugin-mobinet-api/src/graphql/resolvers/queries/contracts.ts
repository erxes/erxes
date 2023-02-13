import { IContext } from '../../../connectionResolver';

const queries = {
  mobiContracts: async (
    _root,
    { customerId }: { customerId: string },
    { models }: IContext
  ) => {
    return models.Contracts.find({ customerId });
  }
};

export default queries;
