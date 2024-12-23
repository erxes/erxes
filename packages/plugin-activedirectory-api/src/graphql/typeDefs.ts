import gql from 'graphql-tag';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
  `;
};

export default typeDefs;
