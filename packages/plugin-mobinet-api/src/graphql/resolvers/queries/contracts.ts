import { IContext } from '../../../connectionResolver';

const queries = {
  mobiContracts: async (
    _root,
    { customerId }: { customerId: string },
    { models }: IContext
  ) => {
    return models.Contracts.find({ customerId });
  },

  mobiContractsGetByTicket: async (
    _root,
    { ticketId }: { ticketId: string },
    { models }: IContext
  ) => {
    return models.Contracts.findOne({ ticketId });
  }
};

export default queries;
