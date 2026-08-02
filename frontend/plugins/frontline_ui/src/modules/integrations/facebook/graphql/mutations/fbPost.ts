import { gql } from '@apollo/client';

export const FACEBOOK_CREATE_POST = gql`
  mutation FacebookCreatePost(
    $erxesApiId: String!
    $pageId: String!
    $message: String!
    $link: String
  ) {
    facebookCreatePost(
      erxesApiId: $erxesApiId
      pageId: $pageId
      message: $message
      link: $link
    )
  }
`;
