const commonParamDefs = `$name: String!`;
const commonParams = `name: $name`;

const add = `
  mutation tradingsAdd(${commonParamDefs}) {
    tradingsAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  add
};
