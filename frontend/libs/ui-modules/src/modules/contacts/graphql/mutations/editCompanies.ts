import { gql } from '@apollo/client';

export const EDIT_COMPANIES = gql`
  mutation CompaniesEdit(
    $_id: String!
    $avatar: String
    $primaryName: String
    $names: [String]
    $primaryPhone: String
    $phones: [String]
    $primaryEmail: String
    $emails: [String]
    $primaryAddress: JSON
    $size: Int
    $website: String
    $industry: [String]
    $email: String
    $businessType: String
    $tagIds: [String]
    $ownerId: String
    $propertiesData: JSON
    $code: String
    $description: String
    $location: String
    $parentCompanyId: String
    $isSubscribed: String
  ) {
    companiesEdit(
      _id: $_id
      avatar: $avatar
      primaryName: $primaryName
      names: $names
      primaryPhone: $primaryPhone
      phones: $phones
      primaryEmail: $primaryEmail
      emails: $emails
      primaryAddress: $primaryAddress
      size: $size
      website: $website
      industry: $industry
      email: $email
      businessType: $businessType
      tagIds: $tagIds
      ownerId: $ownerId
      propertiesData: $propertiesData
      code: $code
      description: $description
      location: $location
      parentCompanyId: $parentCompanyId
      isSubscribed: $isSubscribed
    ) {
      _id
    }
  }
`;
