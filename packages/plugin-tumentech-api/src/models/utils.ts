import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendFormsMessage } from '../messageBroker';

export const prepareDateFilter = async (
  subdomain: string,
  dateType: 'createdAt' | 'ShipmentTime',
  date?: string
) => {
  const d = date || new Date();

  const startDate = new Date(d);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(d);
  endDate.setHours(23, 59, 59, 999);

  if (dateType === 'createdAt') {
    return {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
  } else {
    const field = await sendFormsMessage({
      subdomain,
      action: 'fields.findOne',
      data: {
        query: { code: dateType }
      },
      isRPC: true,
      defaultValue: null
    });

    if (field) {
      return {
        'customFieldsData.field': field._id,
        'customFieldsData.dateValue': { $gte: startDate, $lte: endDate }
      };
    }
  }
};

export const filterDealsByCar = async (
  models: IModels,
  subdomain: string,
  carId: string,
  stageId: string,
  date?: string,
  dateType: 'createdAt' | 'ShipmentTime' = 'ShipmentTime'
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
      'customFieldsData.value': { $in: categoryIds },
      stageId
    },
    isRPC: true,
    defaultValue: []
  });

  return deals;
};

export const filterDealsByRoute = async (
  models: IModels,
  subdomain: string,
  routeId: string,
  stageId: string,
  date?: string,
  dateType: 'createdAt' | 'ShipmentTime' = 'ShipmentTime'
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
      _id: { $in: dealIds },
      stageId
    },
    isRPC: true
  });

  return deals || [];
};

export const filterDeals = async (
  models: IModels,
  subdomain: string,
  stageId: string,
  carId: string,
  routeId: string,
  date?: string,
  dateType: 'createdAt' | 'ShipmentTime' = 'ShipmentTime'
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

  const data: any = {
    _id: { $in: dealIds },
    stageId,
    'customFieldsData.value': { $in: categoryIds }
  };

  if (date) {
    data.$and = [await prepareDateFilter(subdomain, dateType, date)];
  }

  const deals = await sendCardsMessage({
    subdomain,
    action: 'deals.find',
    data,
    isRPC: true,
    defaultValue: []
  });

  return deals;
};
