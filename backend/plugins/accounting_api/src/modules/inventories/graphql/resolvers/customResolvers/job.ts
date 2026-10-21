import { IJob, IJobItem } from '~/modules/inventories/@types/jobs';

export const Job = {
  laborCosts: (card: IJob) => card.laborCosts ?? [],
  overheadCosts: (card: IJob) => card.overheadCosts ?? [],
};

export const JobItem = {
  product(item: IJobItem) {
    if (!item.productId) {
      return;
    }

    return {
      __typename: 'Product',
      _id: item.productId,
    };
  },
};
