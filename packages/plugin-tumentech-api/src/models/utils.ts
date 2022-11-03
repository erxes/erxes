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
        $and: [
          {
            'customFieldsData.field': field._id,
            'customFieldsData.dateValue': { $gte: startDate, $lte: endDate }
          }
        ]
      };
    }
  }
};

export const locationFilter = async (
  subdomain: string,
  currentLocation?: { lat: number; lng: number },
  searchRadius?: number
) => {
  if (!currentLocation || !searchRadius) {
    return {};
  }

  const field = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: { code: 'ShipmentWarehouseLocation' }
    },
    isRPC: true,
    defaultValue: null
  });

  if (!field) {
    return {};
  }

  return {
    $and: [
      {
        'customFieldsData.field': field._id,
        'customFieldsData.locationValue': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [currentLocation.lng, currentLocation.lat]
            },
            $maxDistance: searchRadius
          }
        }
      }
    ]
  };
};

export const filterDealsByCar = async (
  models: IModels,
  subdomain: string,
  carId: string,
  stageId: string,
  date?: string,
  dateType: 'createdAt' | 'ShipmentTime' = 'ShipmentTime',
  currentLocation?: { lat: number; lng: number },
  searchRadius?: number
) => {
  const car = await models.Cars.getCar(carId);

  const categoryIds = await models.ProductCarCategories.find({
    carCategoryId: car.carCategoryId
  })
    .distinct('productCategoryId')
    .lean();

  const data: any = {
    'customFieldsData.value': { $in: categoryIds },
    stageId,
    ...(await prepareDateFilter(subdomain, dateType || 'ShipmentTime', date)),
    ...(await locationFilter(subdomain, currentLocation, searchRadius))
  };

  const deals = await sendCardsMessage({
    subdomain,
    action: 'deals.find',
    data,
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
  dateType: 'createdAt' | 'ShipmentTime' = 'ShipmentTime',
  currentLocation?: { lat: number; lng: number },
  searchRadius?: number
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

  const data: any = {
    _id: { $in: dealIds },
    stageId,
    ...(await prepareDateFilter(subdomain, dateType || 'ShipmentTime', date)),
    ...(await locationFilter(subdomain, currentLocation, searchRadius))
  };

  const deals = await sendCardsMessage({
    subdomain,
    action: 'deals.find',
    data,
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
  dateType: 'createdAt' | 'ShipmentTime' = 'ShipmentTime',
  currentLocation?: { lat: number; lng: number },
  searchRadius?: number
) => {
  const car = await models.Cars.getCar(carId);

  const categoryIds = await models.ProductCarCategories.find({
    carCategoryId: car.carCategoryId
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
    'customFieldsData.value': { $in: categoryIds },
    ...(await prepareDateFilter(subdomain, dateType || 'ShipmentTime', date)),
    ...(await locationFilter(subdomain, currentLocation, searchRadius))
  };

  const deals = await sendCardsMessage({
    subdomain,
    action: 'deals.find',
    data,
    isRPC: true,
    defaultValue: []
  });

  return deals;
};
