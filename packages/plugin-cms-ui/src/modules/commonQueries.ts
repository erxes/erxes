import { gql } from "@apollo/client";

export const TRANSLATIONS = gql`
query CmsPostTranslations($postId: String) {
  cmsPostTranslations(postId: $postId) {
    _id
    content
    customFieldsData
    excerpt
    language
    postId
    title
  }
}
`;


export const ADD_TRANSLATION = gql`
mutation CmsPostsAddTranslation($input: PostTranslationInput!) {
  cmsPostsAddTranslation(input: $input) {
    _id
  }
}
`;

export const EDIT_TRANSLATION = gql`
mutation CmsPostsEditTranslation( $input: PostTranslationInput!) {
  cmsPostsEditTranslation(input: $input) {
    _id
  }
}
`;