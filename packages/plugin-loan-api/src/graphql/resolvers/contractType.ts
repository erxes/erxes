const contractTypeResolvers = {
  productCategories(contractType) {
    return (contractType.productCategoryIds || []).map(_id => ({
      __typename: 'User',
      _id
    }));
  }
};

export default contractTypeResolvers;
