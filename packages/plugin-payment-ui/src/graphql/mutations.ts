const commonParamDefs = `$name: String!`;
const commonParams = `name: $name`;

const add = `
  mutation paymentsAdd(${commonParamDefs}) {
    paymentsAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  add
};
