import { gql } from 'apollo-server-express';
import Query from './Query';
import Mutation from './Mutation';
import CmsCategory from './CmsCategory';

export default async function genTypeDefs(serviceDiscovery) {
  return gql`
    scalar JSON
    scalar Date

    ${CmsCategory}

    ${Query}
    ${Mutation}
  `;
}
