import { IEbarimtDocument } from '../../models/definitions/ebarimt';

const putResponse = {
  async user(putResponse: IEbarimtDocument) {
    if (!putResponse.userId) {
      return;
    }

    return {
      __typename: 'User',
      _id: putResponse.userId
    }
  },
};

export default putResponse;
