import { gql } from "@apollo/client";

export const TAGS_TYPES = gql`
  query TagsTypes {
    tagsGetTypes
  }
`;
