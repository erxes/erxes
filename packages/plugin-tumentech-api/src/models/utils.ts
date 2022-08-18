import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';

export const filterDealsByCar = async (
  models: IModels,
  subdomain: string,
  carId
) => {
  const car = await models.Cars.getCar(carId);

  const categoryIds = await models.ProductCarCategories.find({
    carCategoryId: car.categoryId
  })
    .distinct('productCategoryId')
    .lean();

  const deals = await sendCardsMessage({
    subdomain,
    action: 'deals.find',
    data: {
      'customFieldsData.value': { $in: categoryIds }
    },
    isRPC: true
  });

  return deals || [];
};

export const filterDealsByRoute = async (
  models: IModels,
  subdomain: string,
  routeId
) => {
  const directionIds = await models.Routes.findOne({ _id: routeId })
    .distinct('directionIds')
    .lean();

  const placeIds = await models.Directions.find({
    _id: { $in: directionIds }
  })
    .distinct('placeIds')
    .lean();

  const dealIds = await models.DealPlaces.find({
    $or: [
      { startPlaceId: { $in: placeIds } },
      { endPlaceId: { $in: placeIds } }
    ]
  })
    .distinct('dealId')
    .lean();

  const deals = await sendCardsMessage({
    subdomain,
    action: 'deals.find',
    data: {
      _id: { $in: dealIds }
    },
    isRPC: true
  });

  return deals || [];
};

export const filterDeals = async (
  models: IModels,
  subdomain: string,
  carId: string,
  routeId: string
) => {
  const car = await models.Cars.getCar(carId);

  const categoryIds = await models.ProductCarCategories.find({
    carCategoryId: car.categoryId
  })
    .distinct('productCategoryId')
    .lean();

  const directionIds = await models.Routes.findOne({ _id: routeId })
    .distinct('directionIds')
    .lean();

  const placeIds = await models.Directions.find({
    _id: { $in: directionIds }
  })
    .distinct('placeIds')
    .lean();

  const dealIds = await models.DealPlaces.find({
    $or: [
      { startPlaceId: { $in: placeIds } },
      { endPlaceId: { $in: placeIds } }
    ]
  })
    .distinct('dealId')
    .lean();

  const deals = await sendCardsMessage({
    subdomain,
    action: 'deals.find',
    data: {
      _id: { $in: dealIds },
      'customFieldsData.value': { $in: categoryIds }
    },
    isRPC: true
  });

  return deals || [];
};
