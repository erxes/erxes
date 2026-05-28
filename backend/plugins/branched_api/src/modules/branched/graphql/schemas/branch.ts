export const types = `
  type Branch @key(fields: "_id") {
    _id: String!
    name: String!
    address: String
    phone: String
    email: String
    managerId: String
    employeeIds: [String]
    isActive: Boolean
    code: String
    description: String
    order: Int
    parentId: String
    supervisorId: String
    createdAt: Date
    modifiedAt: Date
  }

  type Sale @key(fields: "_id") {
    _id: String!
    amount: Float!
    date: Date!
    branchId: String!
    productId: String!
    quantity: Int!
    customerId: String
    description: String
    paymentType: String
    status: String
    discount: Float
    tax: Float
    createdAt: Date
    modifiedAt: Date
  }

  type Task @key(fields: "_id") {
    _id: String!
    title: String!
    description: String
    assigneeId: String
    branchId: String!
    dueDate: Date
    status: String
    priority: String
    createdAt: Date
    updatedAt: Date
  }
`;

export const queries = `
  branches(
    isActive: Boolean,
    search: String,
    ids: [String],
    excludeIds: Boolean,
    perPage: Int,
    page: Int
  ): [Branch]
  branchDetail(_id: String!): Branch
  branchesTotalCount: Int

  sales(
    branchId: String,
    startDate: Date,
    endDate: Date,
    search: String,
    perPage: Int,
    page: Int
  ): [Sale]
  saleDetail(_id: String!): Sale
  salesTotalCount(branchId: String): Int

  tasks(
    branchId: String,
    status: String,
    assigneeId: String,
    priority: String,
    startDate: Date,
    endDate: Date,
    search: String,
    perPage: Int,
    page: Int
  ): [Task]
  taskDetail(_id: String!): Task
  tasksTotalCount(branchId: String): Int
`;

export const mutations = `
  branchesAdd(
    name: String!,
    address: String,
    phone: String,
    email: String,
    managerId: String,
    employeeIds: [String],
    isActive: Boolean,
    code: String,
    description: String,
    order: Int,
    parentId: String,
    supervisorId: String
  ): Branch

  branchesEdit(
    _id: String!,
    name: String,
    address: String,
    phone: String,
    email: String,
    managerId: String,
    employeeIds: [String],
    isActive: Boolean,
    code: String,
    description: String,
    order: Int,
    parentId: String,
    supervisorId: String
  ): Branch

  branchesRemove(_ids: [String!]!): JSON

  salesAdd(
    amount: Float!,
    date: Date!,
    branchId: String!,
    productId: String!,
    quantity: Int!,
    customerId: String,
    description: String,
    paymentType: String,
    status: String,
    discount: Float,
    tax: Float
  ): Sale

  salesEdit(
    _id: String!,
    amount: Float,
    date: Date,
    branchId: String,
    productId: String,
    quantity: Int,
    customerId: String,
    description: String,
    paymentType: String,
    status: String,
    discount: Float,
    tax: Float
  ): Sale

  salesRemove(_ids: [String!]!): JSON

  tasksAdd(
    title: String!,
    description: String,
    assigneeId: String,
    branchId: String!,
    dueDate: Date,
    status: String,
    priority: String
  ): Task

  tasksEdit(
    _id: String!,
    title: String,
    description: String,
    assigneeId: String,
    branchId: String,
    dueDate: Date,
    status: String,
    priority: String
  ): Task

  tasksRemove(_ids: [String!]!): JSON
`;
