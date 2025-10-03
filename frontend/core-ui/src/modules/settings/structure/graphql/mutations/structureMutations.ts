import { gql } from '@apollo/client';

const EDIT_STRUCTURE = gql`
  mutation StructuresEdit(
    $id: String!
    $title: String!
    $description: String
    $supervisorId: String
    $code: String
    $phoneNumber: String
    $email: String
    $image: AttachmentInput
  ) {
    structuresEdit(
      _id: $id
      title: $title
      description: $description
      supervisorId: $supervisorId
      code: $code
      phoneNumber: $phoneNumber
      email: $email
      image: $image
    ) {
      _id
    }
  }
`;

const ADD_STRUCTURE = gql`
  mutation StructuresAdd(
    $title: String!
    $description: String
    $supervisorId: String
    $code: String
    $phoneNumber: String
    $email: String
  ) {
    structuresAdd(
      title: $title
      description: $description
      supervisorId: $supervisorId
      code: $code
      phoneNumber: $phoneNumber
      email: $email
    ) {
      _id
    }
  }
`;

export { EDIT_STRUCTURE, ADD_STRUCTURE };
