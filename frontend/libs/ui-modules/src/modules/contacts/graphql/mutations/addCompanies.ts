import { gql } from '@apollo/client';

export const COMPANIES_ADD = gql`
  mutation CompaniesAdd(
    $primaryName: String
    $primaryPhone: String
    $website: String
    $size: Int
    $industry: [String]
    $email: String
    $ownerId: String
    $businessType: String
    $description: String
    $code: String
    $avatar: String
    $location: String
    $parentCompanyId: String
  ) {
    companiesAdd(
      primaryName: $primaryName
      primaryPhone: $primaryPhone
      website: $website
      size: $size
      industry: $industry
      email: $email
      ownerId: $ownerId
      businessType: $businessType
      description: $description
      code: $code
      avatar: $avatar
      location: $location
      parentCompanyId: $parentCompanyId
    ) {
      _id
    }
  }
`;
