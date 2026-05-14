import { gql } from '@apollo/client';

export const TEMPLATE_ADD = gql`
  mutation TemplateAdd(
    $name: String
    $description: String
    $contentType: String
    $contentId: String
    $categoryIds: [String]
  ) {
    templateAdd(
      name: $name
      description: $description
      contentType: $contentType
      contentId: $contentId
      categoryIds: $categoryIds
    ) {
      _id
    }
  }
`;
