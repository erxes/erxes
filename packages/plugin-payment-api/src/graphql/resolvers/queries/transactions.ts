import { IContext } from '../../../connectionResolver';

const queries = {
  transactions(_root, args, { models }: IContext) {
    const { _ids = [], invoiceId } = args;
    if (!_ids.length && !invoiceId) {
      throw new Error('At least one parameter is required');
    }

    const query: any = {};

    if (_ids.length) {
      query._id = { $in: _ids };
    }

    if (invoiceId) {
      query.$or = [{ invoiceId }, { invoiceNumber: invoiceId }];
    }

    return models.Transactions.find(query);
  },
};

export default queries;
