import {
  assetCategoryParamsDef,
  assetCategoryParams
} from '../../../common/graphql/assetCategory';

const assetCategoryAdd = `
  mutation assetCategoryAdd(${assetCategoryParamsDef}) {
    assetCategoryAdd(${assetCategoryParams}) {
      _id
    }
  }
`;

const assetCategoryEdit = `
  mutation assetCategoryEdit($_id: String!, ${assetCategoryParamsDef}) {
    assetCategoryEdit(_id: $_id, ${assetCategoryParams}) {
      _id
    }
  }
`;
const assetCategoryRemove = `
  mutation assetCategoryRemove($_id: String!) {
    assetCategoryRemove(_id: $_id)
  }
`;

export default { assetCategoryAdd, assetCategoryEdit, assetCategoryRemove };
