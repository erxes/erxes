import { IContext } from '~/connectionResolvers';
import { IAddress } from '~/modules/ecommerce/@types/address';

export const addressMutations = {
  addressAdd: async (_root, params: IAddress, { models }: IContext) => {
    const address = await models.Address.createAddress(params);

    if (!address) {
      throw new Error('Failed to create address');
    }

    return address;
  },

  addressUpdate: async (
    _root,
    params: { _id: string } & IAddress,
    { models }: IContext,
  ) => {
    const { _id, ...doc } = params;

    const address = await models.Address.updateAddress(_id, doc);

    if (!address) {
      throw new Error(`Address not found: ${_id}`);
    }

    return address;
  },

  addressRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    const address = await models.Address.removeAddress(_id);

    if (!address) {
      throw new Error(`Address not found: ${_id}`);
    }

    return address;
  },
};

export default addressMutations;
