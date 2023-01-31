import { sendCoreMessage } from '../../messageBroker';
import { ICarDocument } from '../../models/definitions/cars';

const cars = {
  async owner(car: ICarDocument) {
    return (
      car.ownerId && {
        __typename: 'User',
        _id: car.ownerId
      }
    );
  },

  async customer(car: ICarDocument, {}, { models, subdomain }) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'car',
        mainTypeId: car._id.toString(),
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    return models.Customers.find({ _id: { $in: customerIds || [] } });
  },

  category(car: ICarDocument, {}, { models }) {
    return models.CarCategories.findOne({ _id: car.categoryId });
  }
};

export default cars;
