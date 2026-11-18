import { gql } from '@apollo/client';

export const USERS_CONFIG_APPEARANCE = gql`
  mutation usersConfigAppearance(
    $layout: String!
    $frameColor: String
    $navPosition: String
  ) {
    usersConfigAppearance(
      layout: $layout
      frameColor: $frameColor
      navPosition: $navPosition
    ) {
      _id
      appearance {
        layout
        frameColor
        navPosition
      }
    }
  }
`;
