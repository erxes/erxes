import { IContext } from '../../connectionResolver';
import { ITrackingItem } from '../../models/definitions/trips';
import {
  ITumentechDeal,
  ITrackingData
} from '../../models/definitions/tumentechDeal';
import { sendContactsMessage } from '../../messageBroker';

const TumentechDeal = {
  async deal(tumentechDeal: ITumentechDeal, _params) {
    const { dealId } = tumentechDeal;
    if (!dealId) {
      return null;
    }

    return {
      __typename: 'Deal',
      _id: dealId
    };
  },

  async startPlace(
    tumentechDeal: ITumentechDeal,
    _params,
    { models: { Places } }: IContext
  ) {
    const { startPlaceId } = tumentechDeal;

    if (!startPlaceId) {
      return null;
    }

    return Places.getPlace({ _id: startPlaceId });
  },

  async endPlace(
    tumentechDeal: ITumentechDeal,
    _params,
    { models: { Places } }: IContext
  ) {
    const { endPlaceId } = tumentechDeal;

    if (!endPlaceId) {
      return null;
    }

    return Places.getPlace({ _id: endPlaceId });
  },

  async trackingData(
    tumentechDeal,
    _params,
    { models: { TumentechDeals, Cars } }: IContext
  ) {
    const trackingDatas = await TumentechDeals.findOne({
      _id: tumentechDeal._id
    }).distinct('trackingData');

    console.log('trackingDatas', trackingDatas);

    const sortList = (trackingData: ITrackingItem[]) => {
      const sorted = trackingData.sort((a, b) => a[2] - b[2]);

      return sorted.map(t => ({
        lat: t[0],
        lng: t[1],
        trackedDate: new Date(t[2] * 1000)
      }));
    };

    const sortedData: ITrackingData[] = [];

    for (const trackingData of trackingDatas) {
      const car = await Cars.findOne({ _id: trackingData.carId });

      const obj = {
        carId: trackingData.carId,
        car,
        list: sortList(trackingData.list)
      };

      sortedData.push(obj);
    }

    return sortedData;
  },

  async warehouseUserToLoad(
    tumentechDeal: ITumentechDeal,
    _params,
    { subdomain }: IContext
  ) {
    const { warehouseUserIdToLoad } = tumentechDeal;

    if (!warehouseUserIdToLoad) {
      return null;
    }

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: warehouseUserIdToLoad
      },
      isRPC: true,
      defaultValue: undefined
    });
    if (!customer) {
      return null;
    }

    return customer;
  },

  async warehouseUserToUnload(
    tumentechDeal: ITumentechDeal,
    _params,
    { subdomain }: IContext
  ) {
    const { warehouseUserIdToUnload } = tumentechDeal;

    if (!warehouseUserIdToUnload) {
      return null;
    }

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: warehouseUserIdToUnload
      },
      isRPC: true,
      defaultValue: undefined
    });
    if (!customer) {
      return null;
    }

    return customer;
  }
};

export { TumentechDeal };
