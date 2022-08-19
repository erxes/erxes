const commonParamDefs = `$name: String!, $type: String!, $colorCode: String, $parentId: String`;
const commonParams = `name: $name, type: $type, colorCode: $colorCode, parentId: $parentId`;

const add = `
  mutation tagsAdd(${commonParamDefs}) {
    tagsAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  add
};
