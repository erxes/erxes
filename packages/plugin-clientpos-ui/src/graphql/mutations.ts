const commonParamDefs = `$name: String!`;
const commonParams = `name: $name`;

const add = `
  mutation clientpossAdd(${commonParamDefs}) {
    clientpossAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  add
};
