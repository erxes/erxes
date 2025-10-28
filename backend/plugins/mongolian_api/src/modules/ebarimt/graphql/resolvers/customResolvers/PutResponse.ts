import { IEbarimtDocument } from '~/modules/ebarimt/@types';

export default {
  async user(putResponse: IEbarimtDocument) {
    if (!putResponse.userId) {
      return;
    }

    return {
      __typename: 'User',
      _id: putResponse.userId,
    };
  },
};
