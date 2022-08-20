const Collaterals = {
  category(collateral) {
    async ({ models }) => {
      const product = await models.Products.findOne({
        _id: collateral.collateralsData.collateralId
      });
      return models.ProductCategories.findOne({ _id: product.categoryId });
    };
  },
  vendor(collateral) {
    async ({ models }) => {
      const product = await models.Products.findOne({
        _id: collateral.collateralsData.collateralId
      });
      return models.Companies.findOne({ _id: product.vendorId });
    };
  },
  product(collateral) {
    async ({ models }) => {
      return models.Products.findOne({
        _id: collateral.collateralsData.collateralId
      });
    };
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
