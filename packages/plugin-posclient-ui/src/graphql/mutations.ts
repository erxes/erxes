const commonParamDefs = `$name: String!`;
const commonParams = `name: $name`;

const add = `
  mutation posclientsAdd(${commonParamDefs}) {
    posclientsAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  add
};
