import gql from 'graphql-tag';
import {
  types as configTypes,
  mutations as configMutations,
  queries as configQueries} from'./schema/configs'

  import {
    types as accountTypes,
    queries as accountQueries} from'./schema/accounts'

const typeDefs = async () => gql`
  scalar JSON
  scalar Date

  ${configTypes}
  ${accountTypes}
  extend type Query {
    ${configQueries}
    ${accountQueries}
  }
  extend type Mutation {
    ${configMutations}
  }
`;

export default typeDefs;
