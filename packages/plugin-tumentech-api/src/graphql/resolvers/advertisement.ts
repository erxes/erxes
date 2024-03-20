import { IContext } from '../../connectionResolver';
import { sendContactsMessage, sendProductsMessage } from '../../messageBroker';
import { IAdvertisement } from '../../models/definitions/adviertisement';

const Advertisement = {
  async cars(advertisement: IAdvertisement, {}, { models }: IContext) {
    const carList = await models.Cars.find({
      _id: { $in: advertisement.carIds },
    });
    return carList;
  },
  async driver(advertisement: IAdvertisement, {}, { subdomain }: IContext) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: advertisement.driverId },
      isRPC: true,
      defaultValue: [],
    });

    return customer;
  },
  async startPlaceObject(
    advertisement: IAdvertisement,
    {},
    { models }: IContext,
  ) {
    const place = await models.Places.findById(advertisement.startPlace);
    return place;
  },
  async endPlaceObject(
    advertisement: IAdvertisement,
    {},
    { models }: IContext,
  ) {
    const place = await models.Places.findById(advertisement.endPlace);
    return place;
  },

  async productCategories(
    advertisement: IAdvertisement,
    {},
    { models, subdomain }: IContext,
  ) {
    const productCategories = await sendProductsMessage({
      subdomain,
      action: 'categories.find',
      data: { query: { _id: { $in: advertisement.productCategoryIds } } },
      isRPC: true,
      defaultValue: [],
    });

    return productCategories;
  },
};

export { Advertisement };
