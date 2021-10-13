const posList = `
  query posList {
    allPos {
      _id
      name
      description
    }
  }
`;

const configs = `
  query posConfigs($posId: String!) {
    posConfigs(posId: $posId) {
      _id
      posId
      code
      value
    }
  }
`

export default {
  posList,
  configs
};
