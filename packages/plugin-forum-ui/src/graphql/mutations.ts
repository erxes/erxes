const commonParamDefs = `$name: String!`;
const commonParams = `name: $name`;

const add = `
  mutation forumsAdd(${commonParamDefs}) {
    forumsAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  add
};
