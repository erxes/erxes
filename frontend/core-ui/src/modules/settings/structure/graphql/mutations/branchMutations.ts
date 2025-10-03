import { gql } from '@apollo/client';

const commonDefs = `
  $userIds: [String]
  $coordinate: CoordinateInput
  $image: AttachmentInput
  $radius: Int
  $title: String
  $address: String
  $supervisorId: String
  $code: String
  $parentId: String
  $phoneNumber: String
  $email: String
  $links: JSON
`;

const commonVars = `
  userIds: $userIds
  coordinate: $coordinate
  image: $image
  radius: $radius
  title: $title
  address: $address
  supervisorId: $supervisorId
  code: $code
  parentId: $parentId
  phoneNumber: $phoneNumber
  email: $email
  links: $links
`;

export const ADD_BRANCH = gql`
  mutation BranchesAdd(${commonDefs}) {
    branchesAdd(${commonVars}) {
      _id
      address
      code
      parentId
      userCount
      title
    }
  }
`;

export const EDIT_BRANCH = gql`
  mutation BranchesEdit($id: String! $workhours: JSON ${commonDefs}) {
    branchesEdit(_id: $id, workhours: $workhours, ${commonVars}) {
      _id
      address
      code
      parentId
      userCount
      title
    }
  }
`;

export const REMOVE_BRANCHES = gql`
  mutation BranchesRemove($ids: [String!]) {
    branchesRemove(ids: $ids)
  }
`;
