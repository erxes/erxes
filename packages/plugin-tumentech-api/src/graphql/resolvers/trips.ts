import { sendCoreMessage } from './../../messageBroker';
import { IContext } from '../../connectionResolver';
import { ITripDocument } from '../../models/definitions/trips';

const Trip = {
  async route(trip: ITripDocument, _params, { models: { Routes } }: IContext) {
    return Routes.findOne({ _id: trip.routeId });
  },

  async deals(trip: ITripDocument, params, { subdomain }: IContext) {
    const { customerId } = params;

    if (!customerId) {
      return (trip.dealIds || []).map(_id => ({ __typename: 'Deal', _id }));
    }

    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.getConformities',
      data: {
        mainType: 'deal',
        mainTypeIds: trip.dealIds,
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    if (conformities.length === 0) {
      return [];
    }

    return conformities
      .filter(c => c.relTypeId === customerId)
      .map(c => ({ __typename: 'Deal', _id: c.mainTypeId }));
  },

  async driver(trip: ITripDocument, _params) {
    return trip.driverId && { __typename: 'Customer', _id: trip.driverId };
  },

  async cars(trip: ITripDocument, _params, { models: { Cars } }: IContext) {
    return Cars.find({ _id: { $in: trip.carIds } }).lean();
  },

  async trackingData(
    trip: ITripDocument,
    _params,
    { models: { Trips } }: IContext
  ) {
    const trackingData = await Trips.findOne({ _id: trip._id }).distinct(
      'trackingData'
    );
    return trackingData.map(t => ({
      lat: t[0],
      lng: t[1],
      trackedDate: new Date(t[2] * 1000)
    }));
  }
};

export { Trip };
