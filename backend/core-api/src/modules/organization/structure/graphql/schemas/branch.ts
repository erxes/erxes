import { commonParams } from './commonTypeDefs';

export const BranchTypes = ` 
    type Branch @key(fields: "_id") @cacheControl(maxAge: 3){
        _id: String
        title: String
        parentId: String
        supervisorId: String
        supervisor: User
        code: String
        order:String
        users: [User]
        userIds: [String]
        userCount: Int
        parent: Branch
        children: [Branch]
        status:String

        address: String
        radius: Int
        hasChildren:Boolean
        workhours:JSON
        phoneNumber: String
        email: String
        links: JSON
        coordinate: Coordinate
        image: Attachment
    }

    type BranchesListResponse {
        list:[Branch]
        totalCount: Int
        pageInfo: PageInfo
    }
  `;

const commonContactInfoParams = `
    phoneNumber: String
    email: String
    links: JSON
    coordinate: CoordinateInput
    image: AttachmentInput
`;

const commonBranchParams = `
    title: String
    address: String
    supervisorId: String
    code: String
    parentId: String
    userIds: [String]
    radius: Int
    workhours: JSON
    ${commonContactInfoParams}
`;

export const mutations = `
    branchesAdd(${commonBranchParams}): Branch
    branchesEdit(_id: String!, ${commonBranchParams}): Branch
    branchesRemove(ids:[String!]): JSON
`;

export const queries = `
    branches(${commonParams},withoutUserFilter:Boolean): [Branch]
    branchesMain(${commonParams},withoutUserFilter:Boolean): BranchesListResponse
    branchDetail(_id: String!): Branch
`;
