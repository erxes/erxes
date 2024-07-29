const commonParamDefs = `$name: String!, $type: String!, $colorCode: String, $parentId: String`;
const commonParams = `name: $name, type: $type, colorCode: $colorCode, parentId: $parentId`;

const add = `
  mutation tagsAdd(${commonParamDefs}) {
    tagsAdd(${commonParams}) {
      _id
    }
  }
`;

const edit = `
  mutation tagsEdit($_id: String!, ${commonParamDefs}) {
    tagsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const remove = `
  mutation tagsRemove($_id: String!) {
    tagsRemove(_id: $_id)
  }
`;

const merge = `
  mutation tagsMerge($sourceId: String!, $destId: String!) {
    tagsMerge(sourceId: $sourceId, destId: $destId) {
      _id
    }
  }
`;

export default {
  add,
  edit,
  remove,
  merge
};
