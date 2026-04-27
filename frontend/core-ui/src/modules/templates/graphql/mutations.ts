import { gql } from '@apollo/client';

export const REMOVE_TICKETS = gql`
  mutation TemplateRemove($_ids: [String!]) {
    templateRemove(_ids: $_ids)
  }
`;

export const USE_TEMPLATE = gql`
  mutation TemplateUse($id: String!) {
    templateUse(_id: $id)
  }
`;

export const TEMPLATE_CATEGORY_CREATE = gql`
  mutation TemplateCategoryCreate(
    $name: String!
    $code: String!
    $parentId: String
  ) {
    templateCategoryAdd(name: $name, code: $code, parentId: $parentId) {
      _id
      name
      code
      parentId
      createdAt
      createdBy {
        _id
        email
        details {
          avatar
          firstName
          fullName
          lastName
        }
      }
    }
  }
`;

export const TEMPLATE_CATEGORY_UPDATE = gql`
  mutation TemplateCategoryUpdate(
    $_id: String!
    $name: String
    $code: String
    $parentId: String
  ) {
    templateCategoryEdit(
      _id: $_id
      name: $name
      code: $code
      parentId: $parentId
    ) {
      _id
      name
      code
      parentId
      updatedAt
      updatedBy {
        _id
        email
        details {
          avatar
          firstName
          fullName
          lastName
        }
      }
    }
  }
`;

export const TEMPLATE_CATEGORY_REMOVE = gql`
  mutation templateCategoryRemove($_ids: [String!]) {
    templateCategoryRemove(_ids: $_ids)
  }
`;
