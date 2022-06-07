import { ITrackingItem, ITrip } from '../../../models/definitions/trips';
import { IContext } from '../../../connectionResolver';

export interface ITripEdit extends ITrip {
  _id: string;
}

const tripMutations = {
  tripsAdd: async (_root, doc: ITrip, { models }: IContext) => {
    return models.Trips.createTrip(doc);
  },

  tripsEdit: async (_root, doc: ITripEdit, { models }: IContext) => {
    return models.Trips.updateTrip(doc);
  },

  tripsRemove: (_root, { _id }, { models }: IContext) => {
    return models.Trips.remove({ _id });
  },

  tripsUpdateTrackingData: async (
    _root,
    { _id, trackingData }: { _id: string; trackingData: ITrackingItem[] },
    { models }: IContext
  ) => {
    return models.Trips.updateTracking(_id, trackingData);
  }
};

export default tripMutations;
