const commonParamsDef = `
  $name: String!,
  $description: String,
  $emailConfig: JSON,
`;

const commonParams = `
  name: $name,
  description: $description,
  emailConfig: $emailConfig,
`;

const brandAdd = `
  mutation brandsAdd(${commonParamsDef}) {
    brandsAdd(${commonParams}) {
      _id
    }
  }
`;

export default {
  brandAdd
};
