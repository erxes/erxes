import { IContext, IModels } from '../../../connectionResolver';
import { sendClientPortalMessage } from '../../../messageBroker';
import { IAdvertisement } from '../../../models/definitions/adviertisement';

export interface IAdvertisementEdit extends IAdvertisement {
  _id: string;
}

const buildSearch = async (params: IAdvertisement, models: IModels) => {
  const filter: any = {};
  const ADS_TYPE = {
    REGULAR: 'regular',
    DIRECTIONAL: 'directional',
    SEARCH: 'search',
  };
  filter.type = 'search';
  const andArrays: any = [];

  if (params.productCategoryIds) {
    andArrays.push({
      $or: [
        { productCategoryIds: { $exists: false } },
        {
          productCategoryIds: { $eq: [] },
        },
        { productCategoryIds: { $in: params.productCategoryIds || [] } },
      ],
    });
  }

  if (params.startPlace) {
    andArrays.push({
      $or: [
        { startPlace: { $exists: false } },
        {
          startPlace: { $eq: '' },
        },
        {
          startPlace: { $eq: null },
        },
        { startPlace: params.startPlace },
      ],
    });
  } else if (params.type === ADS_TYPE.REGULAR) {
    andArrays.push({
      $or: [
        { startPlace: { $exists: false } },
        {
          startPlace: { $eq: '' },
        },
        {
          startPlace: { $eq: null },
        },
      ],
    });
  }
  if (params.startBegin) {
    andArrays.push({
      $or: [
        { startBegin: { $exists: false } },
        {
          startBegin: { $eq: null },
        },
        {
          startBegin: {
            $lte: params.startEnd,
            $gte: params.startBegin,
            // $lte: new Date(params.startEnd).toISOString(),
            // $gte: new Date(params.startBegin).toISOString(),
          },
        },
      ],
    });
  }
  if (params.endBegin) {
    andArrays.push({
      $or: [
        { endBegin: { $exists: false } },
        {
          endBegin: { $eq: null },
        },
        {
          endBegin: {
            $lte: params.endEnd,
            $gte: params.endBegin,
            // $lte: new Date(params.endEnd),
            // $gte: new Date(params.endBegin),
          },
        },
      ],
    });
  }

  if (params.endPlace) {
    andArrays.push({
      $or: [
        { endPlace: { $exists: false } },
        {
          endPlace: { $eq: '' },
        },
        {
          endPlace: { $eq: null },
        },
        { endPlace: params.endPlace },
      ],
    });
  } else if (params.type === ADS_TYPE.REGULAR) {
    andArrays.push({
      $or: [
        { endPlace: { $exists: false } },
        {
          endPlace: { $eq: '' },
        },
        {
          endPlace: { $eq: null },
        },
      ],
    });
  }

  if (params.generalPlace) {
    andArrays.push({
      $or: [
        { generalPlace: { $exists: false } },
        {
          generalPlace: { $eq: '' },
        },
        {
          generalPlace: { $eq: null },
        },
        { generalPlace: params.generalPlace },
      ],
    });
  } else if (params.type === ADS_TYPE.DIRECTIONAL) {
    andArrays.push({
      $or: [
        { generalPlace: { $exists: false } },
        {
          generalPlace: { $eq: '' },
        },
        {
          generalPlace: { $eq: null },
        },
      ],
    });
  }
  if (params.shift) {
    andArrays.push({
      $or: [
        { shift: { $exists: false } },
        {
          shift: { $eq: '' },
        },
        {
          shift: { $eq: null },
        },
        { shift: params.shift },
      ],
    });
  } else if (params.type === ADS_TYPE.DIRECTIONAL) {
    andArrays.push({
      $or: [
        { shift: { $exists: false } },
        {
          shift: { $eq: '' },
        },
        {
          shift: { $eq: null },
        },
      ],
    });
  }
  if (params.period) {
    andArrays.push({
      $or: [
        { period: { $exists: false } },
        {
          period: { $eq: '' },
        },
        {
          period: { $eq: null },
        },
        { period: params.period },
      ],
    });
  } else if (params.type === ADS_TYPE.DIRECTIONAL) {
    andArrays.push({
      $or: [
        { period: { $exists: false } },
        {
          period: { $eq: '' },
        },
        {
          period: { $eq: null },
        },
      ],
    });
  }
  filter.$and = andArrays;

  // if (params.filterCarCategoryIds) {
  //   const carCategory = await models.CarCategories.findById(carCategoryId);
  //   const isParentCarCategoryId = carCategory?.parentId ? false : true;

  //   let carFilter = {};
  //   if (isParentCarCategoryId) {
  //     carFilter = { parentCarCategoryId: carCategoryId };
  //   } else {
  //     carFilter = { carCategoryId: carCategoryId };
  //   }
  //   const carList = await models.Cars.find(carFilter).lean();
  //   filter.carIds = { $in: carList.map(x => x?._id) };
  // }
  const localCars = await models.Cars.find({
    _id: { $in: params.carIds },
  });

  if (localCars.length > 0) {
    andArrays.push({
      $or: [
        { filterCarCategoryIds: { $exists: false } },
        {
          filterCarCategoryIds: { $eq: [] },
        },
        {
          filterCarCategoryIds: { $in: localCars.map((x) => x?.carCategoryId) },
        },
        {
          filterCarCategoryIds: {
            $in: localCars.map((x) => x?.parentCarCategoryId),
          },
        },
      ],
    });
  }
  return filter;
};
const advertisementMutations = {
  advertisementAdd: async (
    _root,
    doc: IAdvertisement,
    { models, subdomain }: IContext,
  ) => {
    const ads = await models.Advertisement.createAdvertisement(doc);
    if (ads.type === 'search') {
      return ads;
    }
    const searchFilter = await buildSearch(ads, models);

    // order вебээс оруулж өгсөн хадгалсан зараас шүүх
    const list = await models.Advertisement.find(searchFilter);

    const cpUsers = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.find',
      data: {
        erxesCustomerId: {
          $in: list.map((d) => d.driverId),
        },
        clientPortalId: process.env.WEB_CP_ID || '',
        // '6T-06zPDAEZgwlh4thhDn',
      },
      isRPC: true,
      defaultValue: [],
    });

    let notifData: any = {
      title: 'Жолоочийн зар',
      content: `Жолоочийн зар орж ирлээ.`,
      receivers: cpUsers.map((cpUser) => cpUser._id),
      notifType: 'system',
      link: `${ads._id}`,
      isMobile: false,
      eventData: {
        type: 'advertisement',
        id: ads._id,
      },
    };
    if (ads.type === 'directional') {
      const startPlace = await models.Places.findById(ads.startPlace);
      const endPlace = await models.Places.findById(ads.endPlace);
      notifData.content = `${startPlace?.name}-с ${endPlace?.name} явах чиглэлд, жолооч зар орууллаа.`;
    } else if (ads.type === 'regular') {
      notifData.content = `Таны сануулсан тогтмол тээвэрт явах зар орж ирлээ.`;
    }
    sendClientPortalMessage({
      subdomain,
      action: 'sendNotification',
      data: notifData,
    });
    return ads;
  },

  advertisementEdit: async (
    _root,
    doc: IAdvertisementEdit,
    { models }: IContext,
  ) => {
    return models.Advertisement.updateAdvertisement(doc);
  },

  advertisementRemove: (_root, { _id }, { models }: IContext) => {
    return models.Advertisement.remove({ _id });
  },
};

export default advertisementMutations;
