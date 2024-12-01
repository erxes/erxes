import { IActiveDocument } from '../../models/definitions/active';

const actives = {
  async owner(car: IActiveDocument) {
    if (!car.ownerId) {
      return;
    }

    return {
      __typename: 'User',
      _id: car.ownerId,
    };
  },
};

export default actives;
