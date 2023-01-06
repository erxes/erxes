import { ICarDocument } from '../../models/definitions/cars';
import { IContext } from '../../connectionResolver';
import { sendContactsMessage } from '../../messageBroker';

const cars = {
  async owner(car: ICarDocument) {
    return (
      car.ownerId && {
        __typename: 'User',
        _id: car.ownerId
      }
    );
  },

  async customers(car: ICarDocument, {}, { subdomain }: IContext) {
    return (
      car.customerIds &&
      sendContactsMessage({
        subdomain,
        action: 'customers.find',
        data: {
          _id: { $in: car.customerIds }
        },
        isRPC: true,
        defaultValue: []
      })
    );
  },

  category(car: ICarDocument, {}, { models }) {
    return models.CarCategories.findOne({ _id: car.categoryId });
  }
};

export default cars;
