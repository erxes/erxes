import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Branch @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    title: String
    parentId: String
    supervisorId: String
    supervisor: User
    code: String
    order: String
    users: [User]
    userIds: [String]
    userCount: Int
    parent: Branch
    children: [Branch]
    status: String

    address: String
    radius: Int
    hasChildren: Boolean
    workhours: JSON
    holidays: JSON
    phoneNumber: String
    email: String
    links: JSON
    coordinate: Coordinate
    image: Attachment
  }

  type BranchesListResponse {
    list: [Branch]
    totalCount: Int
    pageInfo: PageInfo
  }

  type Department @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    title: String
    description: String
    parentId: String
    supervisorId: String
    supervisor: User
    code: String
    order: String
    parent: Department
    children: [Department]
    childCount: Int
    users: [User]
    userCount: Int
    userIds: [String]
    workhours: JSON
    status: String
  }

  type CPUnitUserDetails {
    avatar: String
    fullName: String
    shortName: String
    position: String
  }

  type CPUnitUser {
    _id: String
    username: String
    email: String
    details: CPUnitUserDetails
  }

  type CPUnitDepartment {
    _id: String
    title: String
    code: String
    description: String
  }

  type CPUnit @cacheControl(maxAge: 3) {
    _id: String!
    title: String
    code: String
    description: String
    department: CPUnitDepartment
    users: [CPUnitUser]
  }
`;

const commonParams = `
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  status: String
  onlyFirstLevel: Boolean
  parentId: String
  sortField: String
  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  cpBranches(${commonParams}, withoutUserFilter: Boolean): [Branch]
  cpBranchesMain(${commonParams}, withoutUserFilter: Boolean): BranchesListResponse
  cpBranchDetail(_id: String!): Branch
  cpDepartments(${commonParams}, withoutUserFilter: Boolean): [Department]
  cpUnits(searchValue: String): [CPUnit]
`;
