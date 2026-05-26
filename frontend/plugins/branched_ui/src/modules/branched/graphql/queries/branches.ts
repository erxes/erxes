import { gql } from '@apollo/client';

const commonParams = `
  $_ids: [String]
  $name: String
  $isActive: Boolean
  $managerId: String
  $createdStartDate: Date
  $createdEndDate: Date
`;

const commonParamDefs = `
  _ids: $_ids,
  name: $name,
  isActive: $isActive,
  managerId: $managerId,
  createdStartDate: $createdStartDate,
  createdEndDate: $createdEndDate
`;

export const GET_BRANCHES = gql`
  query Branches(
    $limit: Int, 
    $cursor: String, 
    $cursorMode: CURSOR_MODE,
    $orderBy: JSON,
    ${commonParams}
  ) {
    branches(
      limit: $limit, 
      cursor: $cursor, 
      cursorMode: $cursorMode,
      orderBy: $orderBy, 
      ${commonParamDefs}
    ) {
      list {
        _id
        name
        address
        phone
        email
        managerId
        employeeIds
        isActive
        createdAt
        updatedAt
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_BRANCH_DETAIL = gql`
  query BranchDetail($_id: String!) {
    branchDetail(_id: $_id) {
      _id
      name
      address
      phone
      email
      managerId
      employeeIds
      isActive
      createdAt
      updatedAt
      sales {
        _id
        amount
        date
        branchId
        productId
        quantity
      }
      tasks {
        _id
        title
        description
        assigneeId
        branchId
        dueDate
        status
        priority
        createdAt
        updatedAt
      }
    }
  }
`;