import { gql } from '@apollo/client';

export const USERS_CONFIG_APPEARANCE = gql`
  mutation usersConfigAppearance($layout: String!, $frameColor: String) {
    usersConfigAppearance(layout: $layout, frameColor: $frameColor) {
      _id
      appearance {
        layout
        frameColor
      }
    }
  }
`;
