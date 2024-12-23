import gql from 'graphql-tag';

import { types as adTypes } from './schema/active';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${adTypes()}
  `;
};

export default typeDefs;
