import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';

const tripsQuery = {
  trips: async (
    _root,
    {
      status,
      page,
      perPage
    }: { status?: string; page?: number; perPage?: number },
    { models }: IContext
  ) => {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    return paginate(models.Trips.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20
    });
  },

  activeTrips: async (_root, {}, { models }: IContext) => {
    return models.Trips.find({ status: 'active' }).lean();
  },

  tripDetail: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    return models.Trips.getTrip({ _id });
  }
};

export default tripsQuery;
