import { gql } from '@apollo/client';

export const companiesAdd = gql`
  mutation companiesAdd(
    $primaryName: String
    $primaryPhone: String
    $website: String
    $size: Int
    $industry: [String]
    $plan: String
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
      plan: $plan
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
      primaryName
      names
      primaryEmail
      emails
      primaryPhone
      phones
      website
      industry
      code
      avatar
      location
      parentCompanyId
    }
  }
`;
