import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { ICollateralDataDoc } from '../../models/definitions/contracts';

const Collaterals = {
  async category(collateral: ICollateralDataDoc, _, { subdomain }: IContext) {
    const product: any = await sendMessageBroker(
      {
        subdomain,
        action: 'products.findOne',
        data: { _id: collateral.collateralId },
        isRPC: true
      },
      'core'
    );

    const categories = await sendMessageBroker(
      {
        subdomain,
        action: 'categories.findOne',
        data: { _id: product.categoryId },
        isRPC: true
      },
      'core'
    );
    return categories;
  },
  async vendor(collateral: ICollateralDataDoc, _, { subdomain }: IContext) {
    const product: any = await sendMessageBroker(
      {
        subdomain,
        action: 'products.findOne',
        data: { _id: collateral.collateralId },
        isRPC: true
      },
      'core'
    );

    const company = await sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: product.vendorId },
        isRPC: true
      },
      'core'
    );

    return company;
  },
  async product(collateral: ICollateralDataDoc, _, { subdomain }: IContext) {
    const product: any = await sendMessageBroker(
      {
        subdomain,
        action: 'products.findOne',
        data: { _id: collateral.collateralId },
        isRPC: true
      },
      'core'
    );
    return product;
  },
  collateralData(collateral) {
    return collateral.collateralsData;
  },
  _id(collateral) {
    return collateral.collateralsData._id;
  },
  contractId(collateral) {
    return collateral._id;
  }
};

export default Collaterals;
