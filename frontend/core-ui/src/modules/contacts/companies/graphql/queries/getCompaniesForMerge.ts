import { gql } from '@apollo/client';

// Everything the merge sheet compares, fetched fresh for the two selected
// companies (the table rows don't carry owner, description, etc.).
export const GET_COMPANIES_FOR_MERGE = gql`
  query CompaniesForMerge($ids: [String], $limit: Int) {
    companies(ids: $ids, limit: $limit) {
      list {
        _id
        avatar
        primaryName
        names
        code
        primaryEmail
        emails
        primaryPhone
        phones
        size
        industry
        businessType
        website
        location
        description
        isSubscribed
        links
        ownerId
        owner {
          _id
          username
          email
          details {
            fullName
          }
        }
        parentCompanyId
        parentCompany {
          _id
          primaryName
        }
      }
    }
  }
`;
