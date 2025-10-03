import { commonParams } from './commonTypeDefs';

export const PositionTypes = `
    type Position @key(fields: "_id") @cacheControl(maxAge: 3){
        _id: String!
        title: String
        code: String
        order: String
        parentId: String
        parent: Position
        status: String
        children: [Position]
        users: [User]
        userIds: [String]
        userCount: Int
    }

    type PositionListQueryResponse {
        list:[Position]
        totalCount: Int
        pageInfo: PageInfo
    }
`;
const commonPositionParams = `
    title: String
    code: String
    parentId: String
    userIds: [String]
    status: String
`;

export const mutations = `
    positionsAdd(${commonPositionParams}):Position
    positionsEdit(_id: String!, ${commonPositionParams}):Position
    positionsRemove(ids:[String!]): JSON
`;

export const queries = `
    positions(${commonParams},withoutUserFilter:Boolean): [Position]
    positionsMain(${commonParams}): PositionListQueryResponse
    positionDetail(_id: String): Position
`;
