import { gql } from '@apollo/client';

const customersQuery = gql`
  query customers(
    $mainType: String
    $mainTypeId: String
    $relType: String
    $isSaved: Boolean
  ) {
    customers(
      conformityMainType: $mainType
      conformityMainTypeId: $mainTypeId
      conformityRelType: $relType
      conformityIsSaved: $isSaved
    ) {
      _id
      firstName
      middleName
      lastName
      avatar
      primaryEmail
      primaryPhone
    }
  }
`;

const LIST = gql`
query InsuranceItemList($category: ID, $product: ID, $vendor: ID, $page: Int, $perPage: Int, $sortField: String, $sortDirection: SortDirection, $searchField: SearchField, $searchValue: JSON, $startDate: Date, $endDate: Date) {
  insuranceItemList(category: $category, product: $product, vendor: $vendor, page: $page, perPage: $perPage, sortField: $sortField, sortDirection: $sortDirection, searchField: $searchField, searchValue: $searchValue, startDate: $startDate, endDate: $endDate) {
    list {
      _id
      customFieldsData
      deal {
        _id
        closeDate
        name
        number
        stage {
          _id
          name
        }
        createdAt
        customFieldsData
        status
      }
      feePercent
      price
      product {
        _id
        name
        tags {
          _id
          name
        }
      }
      totalFee
      productId
      vendorUser {
        _id
        avatar
        company {
          _id
          primaryName
        }
        erxesCustomerId
        firstName
        fullName
        username
      }
      vendorUserId
    }
    totalCount
  }
}
`;

const detailQuery = gql`
query InsuranceItemByDealId($id: String!) {
  insuranceItemByDealId(_id: $id) {
    _id
    contracts
    company {
      _id
      primaryName
      code
    }
    customFieldsData
    customer {
      _id
      code
      emails
      firstName
      primaryEmail
      primaryPhone
      phones
      customFieldsData
    }
    deal {
      _id
      name
      number
      stage {
        _id
        name
      }
      customFieldsData
    }
    price
    totalFee
    vendorUser {
      company {
        _id
        primaryName
        code
      }
    }
    product {
      _id
      category {
        _id
        code
        name
        risks {
          _id
          name
        }
      }
      name
      price
      tags {
        name
      }
      travelProductConfigs {
        numberOfPeople
        price
        duration
      }
      customFieldsData
    }
    feePercent
  }
}
`;

const editMutation = gql`
mutation InsuranceItemEdit($id: ID!, $doc: InsuranceItemInput) {
  insuranceItemEdit(_id: $id, doc: $doc) {
    _id
  }
}
`;

export default {
  customersQuery,
  LIST,
  detailQuery,
  editMutation,
};
