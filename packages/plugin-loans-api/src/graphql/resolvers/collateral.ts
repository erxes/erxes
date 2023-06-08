import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { ICollateralDataDoc } from '../../models/definitions/contracts';

const Collaterals = {
  async category(collateral: ICollateralDataDoc, {}, { subdomain }: IContext) {
    const product: any = await sendMessageBroker(
      {
        subdomain,
        action: 'findOne',
        data: { _id: collateral.collateralId },
        isRPC: true
      },
      'products'
    );

    const categories = await sendMessageBroker(
      {
        subdomain,
        action: 'categories.findOne',
        data: { _id: product.categoryId },
        isRPC: true
      },
      'products'
    );
    return categories;
  },
  async vendor(collateral: ICollateralDataDoc, {}, { subdomain }: IContext) {
    const product: any = await sendMessageBroker(
      {
        subdomain,
        action: 'findOne',
        data: { _id: collateral.collateralId },
        isRPC: true
      },
      'products'
    );

    const company = await sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: product.vendorId },
        isRPC: true
      },
      'contacts'
    );

    return company;
  },
  async product(collateral: ICollateralDataDoc, {}, { subdomain }: IContext) {
    const product: any = await sendMessageBroker(
      {
        subdomain,
        action: 'findOne',
        data: { _id: collateral.collateralId },
        isRPC: true
      },
      'products'
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
