import { cp } from 'fs';
import { IContext } from '../../../connectionResolver';
import { ITumentechDeal } from '../../../models/definitions/tumentechDeal';
import { sendRequest } from '@erxes/api-utils/src';
export interface ITumentechDealEdit extends ITumentechDeal {
  _id: string;
}

const generateGeometry = async (doc: ITumentechDeal, models) => {
  const startPlace = await models.Places.getPlace({
    _id: doc.startPlaceId
  });
  const endPlace = await models.Places.getPlace({ _id: doc.endPlaceId });
  const tripStartedDate = doc.tripStartedDate
    ? new Date(doc.tripStartedDate as any)
    : null;

  if (startPlace && endPlace) {
    const coordinates = `${startPlace.center.lng},${startPlace.center.lat};${endPlace.center.lng},${endPlace.center.lat}`;
    let path: any = null;
    let distance: any = null;
    const response = await sendRequest({
      url: `https://router.project-osrm.org/route/v1/driving/${coordinates}?alternatives=true&steps=false`,
      method: 'GET'
    });

    const { code, routes } = response;

    if (code === 'Ok' && routes.length > 0) {
      path = routes[0].geometry;
      distance = routes[0].distance;

      doc.geometry = path;
      doc.tripDistance = distance;

      if (tripStartedDate) {
        doc.estimatedCloseDate = new Date(
          tripStartedDate.setDate(tripStartedDate.getDate() + distance / 70)
        );
      }
    }
  }

  return doc;
};

const tumentechDealMutations = {
  tumentechDealAdd: async (
    _root,
    doc: ITumentechDeal,
    { models, cpUser }: IContext
  ) => {
    doc.createdAt = new Date();
    doc.createdBy = cpUser.userId;

    if (doc.startPlaceId && doc.endPlaceId) {
      doc = await generateGeometry(doc, models);
    }

    return models.TumentechDeals.createTumentechDeal(doc);
  },

  tumentechDealEdit: async (
    _root,
    doc: ITumentechDealEdit,
    { models, cpUser }: IContext
  ) => {
    const oldDoc = await models.TumentechDeals.getTumentechDeal(
      doc._id,
      '',
      cpUser.userId
    );

    if (
      doc.startPlaceId !== oldDoc.startPlaceId ||
      doc.endPlaceId !== oldDoc.endPlaceId
    ) {
      doc = {
        _id: doc._id,
        ...(await generateGeometry(doc, models))
      };
    }
    return models.TumentechDeals.updateTumentechDeal(doc);
  },

  tumentechDealRemove: (_root, { _id }, { models }: IContext) => {
    return models.TumentechDeals.remove({ _id });
  },

  tumentechDealAddTrackingData: async (
    _root,
    { dealId, carId, trackingData },
    { models }: IContext
  ) => {
    const newTrackingData = trackingData.map(e => [
      e.lat,
      e.lng,
      e.trackedDate.getTime() / 1000
    ]);

    const tracking = await models.Tracking.findOne({ dealId, carId });

    if (!tracking) {
      await models.Tracking.create({
        dealId,
        carId,
        trackingData: newTrackingData
      });
    } else {
      await models.Tracking.updateOne(
        { dealId, carId },
        { $push: { trackingData: { $each: newTrackingData } } }
      );
    }

    return models.TumentechDeals.findOne({ _id: dealId });
  }
};

export default tumentechDealMutations;

// await models.Trips.getTrip({ _id });

// await models.Trips.updateOne(
//   { _id },
//   {
//     $push: {
//       trackingData: {
//         $each: trackingData.map(e => [
//           e.lat,
//           e.lng,
//           e.trackedDate.getTime() / 1000
//         ])
//       }
//     }
//   }
// );

// return models.Trips.findOne({ _id });
