import gql from 'graphql-tag';

const citiesQuery = gql`
  query cities {
    cities {
      id
    }
  }
`;

export default {
  citiesQuery
};
