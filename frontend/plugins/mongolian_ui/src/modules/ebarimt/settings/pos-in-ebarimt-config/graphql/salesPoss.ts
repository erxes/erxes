import gql from 'graphql-tag';

export const GET_SALES_POS = gql`
  query salesPoss(
    $isNotLost: Boolean
    $search: String
    $customerIds: [String]
    $companyIds: [String]
    $assignedUserIds: [String]
    $labelIds: [String]
    $extraParams: JSON
    $closeDateType: String
    $assignedToMe: String
    $branchIds: [String]
    $departmentIds: [String]
    $segment: String
    $segmentData: String
    $createdStartDate: Date
    $createdEndDate: Date
    $stateChangedStartDate: Date
    $stateChangedEndDate: Date
    $startDateStartDate: Date
    $startDateEndDate: Date
    $closeDateStartDate: Date
    $closeDateEndDate: Date
  ) {
    salesPoss(
      isNotLost: $isNotLost
      search: $search
      customerIds: $customerIds
      companyIds: $companyIds
      assignedUserIds: $assignedUserIds
      labelIds: $labelIds
      extraParams: $extraParams
      closeDateType: $closeDateType
      assignedToMe: $assignedToMe
      branchIds: $branchIds
      departmentIds: $departmentIds
      segment: $segment
      segmentData: $segmentData
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      stateChangedStartDate: $stateChangedStartDate
      stateChangedEndDate: $stateChangedEndDate
      startDateStartDate: $startDateStartDate
      startDateEndDate: $startDateEndDate
      closeDateStartDate: $closeDateStartDate
      closeDateEndDate: $closeDateEndDate
    ) {
      _id
      name
      order
      unUsedAmount
      amount
      itemsTotalCount
      code
      age
      defaultTick
      probability
      __typename
    }
  }
`;
