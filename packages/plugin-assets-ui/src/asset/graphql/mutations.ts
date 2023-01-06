import { assetParams, assetParamsDef } from '../../common/graphql/asset';

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

const addKnowledge = `
  mutation AddAssetKnowledge($assetId: String, $knowledgeData: KnowledgeType) {
  addAssetKnowledge(assetId: $assetId, knowledgeData: $knowledgeData)
}
`;

const updateKnowledge = `
  mutation UpdateAssetKnowledge($assetId: String, $knowledgeData: KnowledgeType) {
  updateAssetKnowledge(assetId: $assetId, knowledgeData: $knowledgeData)
}
`;

const removeKnowledge = `
  mutation RemoveAssetKnowledge($assetId: String, $knowledgeId: String) {
  removeAssetKnowledge(assetId: $assetId, knowledgeId: $knowledgeId)
}
`;

export default {
  assetAdd,
  assetEdit,
  assetsRemove,
  assetsMerge,
  addKnowledge,
  updateKnowledge,
  removeKnowledge
};
