import { gql } from '@apollo/client';

export const GLOBAL_SEARCH_CUSTOMERS = gql`
  query GlobalSearchCustomers($searchValue: String, $limit: Int) {
    customers(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
      }
      totalCount
    }
  }
`;

export const GLOBAL_SEARCH_COMPANIES = gql`
  query GlobalSearchCompanies($searchValue: String, $limit: Int) {
    companies(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        primaryName
        primaryEmail
        primaryPhone
      }
      totalCount
    }
  }
`;

export const GLOBAL_SEARCH_CONVERSATIONS = gql`
  query GlobalSearchConversations(
    $searchValue: String
    $limit: Int
    $status: String
  ) {
    conversations(searchValue: $searchValue, limit: $limit, status: $status) {
      list {
        _id
        content
        customer {
          _id
          firstName
          lastName
          primaryEmail
        }
        integration {
          _id
          kind
        }
      }
      totalCount
    }
  }
`;

export const GLOBAL_SEARCH_TICKETS = gql`
  query GlobalSearchTickets($filter: ITicketFilter) {
    getTickets(filter: $filter) {
      list {
        _id
        name
        number
      }
      totalCount
    }
  }
`;

export const GLOBAL_SEARCH_PRODUCTS = gql`
  query GlobalSearchProducts($searchValue: String, $perPage: Int) {
    products(searchValue: $searchValue, perPage: $perPage) {
      _id
      name
      code
      unitPrice
    }
  }
`;

export const GLOBAL_SEARCH_TEAM_MEMBERS = gql`
  query GlobalSearchTeamMembers($searchValue: String, $limit: Int) {
    users(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        email
        username
        details {
          fullName
        }
      }
      totalCount
    }
  }
`;

export const GLOBAL_SEARCH_CHANNELS = gql`
  query GlobalSearchChannels($name: String) {
    getChannels(name: $name) {
      _id
      name
      description
    }
  }
`;

export const GLOBAL_SEARCH_FORMS = gql`
  query GlobalSearchForms($searchValue: String, $limit: Int) {
    forms(searchValue: $searchValue, limit: $limit) {
      list {
        _id
        name
        title
        code
      }
      totalCount
    }
  }
`;

export const GLOBAL_SEARCH_DEALS = gql`
  query GlobalSearchDeals($search: String, $limit: Int) {
    deals(search: $search, limit: $limit) {
      list {
        _id
        name
        number
        boardId
        pipeline {
          _id
          boardId
        }
      }
      totalCount
    }
  }
`;
