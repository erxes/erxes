import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IProductGroupDocument } from '~/modules/ebarimt/@types';

const fetchProduct = async (subdomain: string, _id?: string) => {
  if (!_id) {
    return null;
  }

  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'products',
    action: 'find',
    input: { query: { _id }, limit: 1 },
    defaultValue: [],
  });

  const product = Array.isArray(products) ? products[0] : null;

  if (!product) {
    return { __typename: 'Product', _id };
  }

  return { __typename: 'Product', ...product };
};

export default {
  async user(productGroup: IProductGroupDocument) {
    if (!productGroup.modifiedBy) {
      return;
    }

    return {
      __typename: 'User',
      _id: productGroup.modifiedBy,
    };
  },

  async mainProduct(
    productGroup: IProductGroupDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return fetchProduct(subdomain, productGroup.mainProductId);
  },

  async subProduct(
    productGroup: IProductGroupDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return fetchProduct(subdomain, productGroup.subProductId);
  },
};
