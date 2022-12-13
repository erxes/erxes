import gql from 'graphql-tag';

const citiesAddMutation = gql`
  query cities {
    cities {
      id
    }
  }
`;

export default {
  citiesAddMutation
};
