import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_CUSTOMERS = gql`
  query customersRecordTable(
    $segment: String
    $tagIds: [String]
    $type: String
    $searchValue: String
    $brandIds: [String]
    $integrationIds: [String]
    $formIds: [String]
    $startDate: String
    $endDate: String
    $leadStatus: String
    $sortField: String
    $dateFilters: String
    $segmentData: String
    $emailValidationStatus: String
    $orderBy: JSON
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    customers(
      segment: $segment
      tagIds: $tagIds
      type: $type
      searchValue: $searchValue
      brandIds: $brandIds
      integrationIds: $integrationIds
      formIds: $formIds
      startDate: $startDate
      endDate: $endDate
      leadStatus: $leadStatus
      sortField: $sortField
      dateFilters: $dateFilters
      segmentData: $segmentData
      emailValidationStatus: $emailValidationStatus
      orderBy: $orderBy
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        firstName
        middleName
        lastName
        avatar
        sex
        birthDate
        primaryEmail
        emails
        primaryPhone
        phones
        updatedAt
        position
        department
        leadStatus
        hasAuthority
        description
        isSubscribed
        code
        emailValidationStatus
        phoneValidationStatus
        score
        isOnline
        lastSeenAt
        links
        state
        ownerId
        integrationId
        createdAt
        remoteAddress
        location
        customFieldsData
        trackedData
        tagIds
        cursor
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
