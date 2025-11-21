import { IContext } from '~/connectionResolvers';
import { IAddress } from '~/modules/ecommerce/@types/address';

const addressMutations = {
  addressAdd: async (_root, params: IAddress, { models }: IContext) => {
    console.log('addressMutations', params);

    try {
      const address = await models.Address.createAddress(params);

      if (!address) {
        return;
      }

      return address;
    } catch (error) {
    //   debugError(error.message);
    }
  },
  addressUpdate: async (
    _root,
    params: { _id: string } & IAddress,
    { models }: IContext,
  ) => {
    const { _id, ...doc } = params;

    try {
      const address = await models.Address.updateAddress(_id, doc);

      if (!address) {
        return;
      }

      return address;
    } catch (error) {
    //   debugError(error.message);
    }
  },
  addressRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    try {
      const address = await models.Address.removeAddress(_id);

      if (!address) {
        return;
      }

      return address;
    } catch (error) {
    //   debugError(error.message);
    }
  },
};

export default addressMutations;
