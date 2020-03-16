const growthHacksChanged = `
  subscription growthHacksChanged($_id: String!) {
    growthHacksChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  growthHacksChanged
};
