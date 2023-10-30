const commonParamDefs = `$name: String!, $type: String!, $colorCode: String, $parentId: String`;
const commonParams = `name: $name, type: $type, colorCode: $colorCode, parentId: $parentId`;

const add = `
  mutation tagsAdd(${commonParamDefs}) {
    tagsAdd(${commonParams}) {
      _id
    }
  }
`;

const tagsTag = `
  mutation tagsTag(
    $type: String!
    $targetIds: [String!]!
    $tagIds: [String!]!
  ) {
    tagsTag(type: $type, targetIds: $targetIds, tagIds: $tagIds)
  }
`;

export default {
  add,
  tagsTag
};
