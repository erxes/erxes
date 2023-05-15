import { assetParams, assetParamsDef } from '../../common/graphql/asset';
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
  mutation assetsAssignKbArticles(${listParamDefs}, $articleIds: [String]) {
    assetsAssignKbArticles(${listParams}, articleIds: $articleIds)
  }
`;

export default {
  assetAdd,
  assetEdit,
  assetsRemove,
  assetsMerge,
  assetsAssignKbArticles
};
