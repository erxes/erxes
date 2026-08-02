import type { IPublicApiConfig } from 'erxes-api-shared/core-types';

export const publicApi: IPublicApiConfig = {
  operations: [
    {
      id: 'core.contacts.customers.list.v1',
      name: 'List customers',
      description: 'List and search customer contacts',
      operationName: 'CorePublicCustomersListV1',
      kind: 'query',
      requiredActions: ['contactsRead'],
      document: `
        query CorePublicCustomersListV1(
          $limit: Int
          $cursor: String
          $direction: CURSOR_DIRECTION
          $searchValue: String
        ) {
          customers(
            limit: $limit
            cursor: $cursor
            direction: $direction
            searchValue: $searchValue
          ) {
            list {
              _id
              firstName
              lastName
              primaryEmail
              primaryPhone
              createdAt
              updatedAt
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
    },
    {
      id: 'core.contacts.customers.detail.v1',
      name: 'Get customer',
      description: 'Get one customer contact by identifier',
      operationName: 'CorePublicCustomerDetailV1',
      kind: 'query',
      requiredActions: ['contactsRead'],
      document: `
        query CorePublicCustomerDetailV1($_id: String!) {
          customerDetail(_id: $_id) {
            _id
            firstName
            lastName
            primaryEmail
            primaryPhone
            createdAt
            updatedAt
          }
        }
      `,
    },
    {
      id: 'core.contacts.customers.create.v1',
      name: 'Create customer',
      description: 'Create a customer contact',
      operationName: 'CorePublicCustomerCreateV1',
      kind: 'mutation',
      requiredActions: ['contactsCreate'],
      document: `
        mutation CorePublicCustomerCreateV1(
          $firstName: String
          $lastName: String
          $primaryEmail: String
          $primaryPhone: String
          $description: String
        ) {
          customersAdd(
            firstName: $firstName
            lastName: $lastName
            primaryEmail: $primaryEmail
            primaryPhone: $primaryPhone
            description: $description
          ) {
            _id
            firstName
            lastName
            primaryEmail
            primaryPhone
            description
            createdAt
            updatedAt
          }
        }
      `,
    },
  ],
};
