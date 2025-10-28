import { IEbarimtDocument } from '@/ebarimt/db/definitions/ebarimt';

export const putResponse = {
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
