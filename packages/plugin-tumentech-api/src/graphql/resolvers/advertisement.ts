import { IContext } from '../../connectionResolver';
import { sendContactsMessage } from '../../messageBroker';
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
};

export { Advertisement };
