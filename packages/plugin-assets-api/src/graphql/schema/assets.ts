import {
  attachmentInput,
  attachmentType
} from "@erxes/api-utils/src/commonTypeDefs";
import { assetCategoryParams, assetParams } from "../../common/graphql/asset";

export const types = `

    ${attachmentType}
    ${attachmentInput}
    
    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    extend type Company @key(fields: "_id") {
        _id: String! @external
    }

    type AssetCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
      _id: String!
      name: String
      description: String
      parentId: String
      code: String!
      order: String!
      attachment: Attachment
      status: String
      isRoot: Boolean
      assetCount: Int
    }

    type Asset @key(fields: "_id") @cacheControl(maxAge: 3) {
      _id: String!
      name: String
      code: String
      order: String
      description: String
      unitPrice: Float
      categoryId: String
      parentId: String
      customFieldsData: JSON
      createdAt: Date
      attachment: Attachment
      attachmentMore: [Attachment]
      vendorId: String
      assetCount: Int
      kbArticleIds: [String],
      knowledgeData: JSON

      category: AssetCategory
      parent:Asset
      isRoot: Boolean
      childAssetCount:Int
      vendor: Company
    }

    type AssetKBArticleHistory {
      _id: String
      assetId: String
      kbArticleId: String
      createdAt: Date
      userId: String
      action: String

      article: JSON
      asset:Asset
      user:User
    }
`;

const searchParams = `
    categoryId: String,
    parentId: String,
    searchValue: String,
    page: Int,
    perPage: Int
    ids: [String],
    excludeIds: Boolean,
    withKnowledgebase: Boolean,
    articleIds:[String],
    pipelineId: String,
    boardId: String,
    ignoreIds:[String]
    irregular: Boolean
`;

export const queries = `
  assets(${searchParams}): [Asset]
  assetsTotalCount(${searchParams}): Int
  assetDetail(_id: String): Asset
  assetCategories(parentId: String, searchValue: String, status: String, withKbOnly: Boolean): [AssetCategory]
  assetCategoryDetail(_id: String): AssetCategory
  assetCategoriesTotalCount: Int
  assetKbArticlesHistories(assetId:String):[AssetKBArticleHistory]
`;

export const mutations = `
  assetsAdd(${assetParams}): Asset
  assetsEdit(_id: String!, ${assetParams}): Asset
  assetsRemove(assetIds: [String!]): String
  assetsMerge(assetIds: [String], assetFields: JSON): Asset
  assetsAssignKbArticles(${searchParams},action:String): JSON
  assetCategoryAdd(${assetCategoryParams}): AssetCategory
  assetCategoryEdit(_id: String!, ${assetCategoryParams}): AssetCategory
  assetCategoryRemove(_id: String!): JSON,
`;
