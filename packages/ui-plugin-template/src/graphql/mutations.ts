const commonParamDefs = `$name: String!`;
const commonParams = `name: $name`;

const add = `
  mutation {name}sAdd(${commonParamDefs}) {
    {name}sAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  add,
};
