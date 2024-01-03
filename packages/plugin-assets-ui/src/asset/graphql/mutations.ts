import { assetParams, assetParamsDef } from '../../common/graphql/asset';
import {
  assetCategoryParamsDef,
  assetCategoryParams
} from '../../common/graphql/assetCategory';
import { listParamDefs, listParams } from './queries';

const assetAdd = `
  mutation assetsAdd(${assetParamsDef}) {
    assetsAdd(${assetParams}) {
      _id
    }
  }
`;

const assetEdit = `
  mutation assetsEdit($_id: String!, ${assetParamsDef}) {
    assetsEdit(_id: $_id, ${assetParams}) {
      _id
    }
  }
`;

const assetsMerge = `
  mutation assetsMerge($assetIds: [String], $assetFields: JSON) {
    assetsMerge(assetIds: $assetIds, assetFields: $assetFields) {
      _id
    }
  }
`;

const assetsRemove = `
  mutation assetsRemove($assetIds: [String!]) {
    assetsRemove(assetIds: $assetIds)
  }
`;

const assetsAssignKbArticles = `
  mutation assetsAssignKbArticles(${listParamDefs},$action:String) {
    assetsAssignKbArticles(${listParams},action:$action)
  }
`;

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

export default {
  assetAdd,
  assetEdit,
  assetsRemove,
  assetsMerge,
  assetsAssignKbArticles,
  assetCategoryAdd,
  assetCategoryEdit,
  assetCategoryRemove
};
