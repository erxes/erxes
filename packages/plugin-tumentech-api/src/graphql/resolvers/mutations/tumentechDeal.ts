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
    { models }: IContext
  ) => {
    doc.createdAt = new Date();

    if (doc.startPlaceId && doc.endPlaceId) {
      doc = await generateGeometry(doc, models);
    }
    return models.TumentechDeals.createTumentechDeal(doc);
  },

  tumentechDealEdit: async (
    _root,
    doc: ITumentechDealEdit,
    { models }: IContext
  ) => {
    const oldDoc = await models.TumentechDeals.getTumentechDeal(doc._id, '');

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
  }
};

export default tumentechDealMutations;
