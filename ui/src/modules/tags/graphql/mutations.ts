const commonParamDefs = `$name: String!, $type: String!, $colorCode: String`;
const commonParams = `name: $name, type: $type, colorCode: $colorCode`;

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
  mutation tagsRemove($ids: [String!]!) {
    tagsRemove(ids: $ids)
  }
`;

export default {
  add,
  edit,
  remove
};
