import { gql } from '@apollo/client';

const GET_PACKAGE_LIST = gql`
  query InsurancePackageList($page: Int, $perPage: Int) {
    insurancePackageList(page: $page, perPage: $perPage) {
      list {
        _id
        name
        productIds
        products {
          _id
          code
          name
        }
        lastModifiedBy {
          _id
          details {
            avatar
            firstName
            fullName
            lastName
            middleName
            shortName
          }
          email
        }
        createdAt
      }
      totalCount
    }
  }
`;

const GET_PACKAGE = gql`
  query InsurancePackage($_id: ID!) {
    insurancePackage(_id: $_id) {
      createdAt
      _id
      lastModifiedAt
      lastModifiedBy {
        _id
      }
      name
      productIds
      products {
        _id
        code
        companyProductConfigs {
          companyId
          specificPrice
        }
        createdAt
        description
        lastModifiedBy {
          _id
        }
        name
        price

        updatedAt
      }
    }
  }
`;

export default {
  GET_PACKAGE_LIST,
  GET_PACKAGE
};
