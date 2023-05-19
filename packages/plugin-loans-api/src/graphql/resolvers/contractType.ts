import { IContractTypeDocument } from '../../models/definitions/contractTypes';

const contractTypeResolvers = {
  productCategories(contractType: IContractTypeDocument) {
    return (contractType.productCategoryIds || []).map(_id => ({
      __typename: 'User',
      _id
    }));
  }
};

export default contractTypeResolvers;
