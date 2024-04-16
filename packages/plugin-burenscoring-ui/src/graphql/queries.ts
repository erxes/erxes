const list = `
    query listQuery {
      burenscorings
    }
  
`;

const listBurenscoringTypes = `
  query listBurenscoringTypeQuery{
    burenscoringTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query burenscoringsTotalCount{
    burenscoringsTotalCount
  }
`;

export default {
  list,
  totalCount,
  listBurenscoringTypes
};
