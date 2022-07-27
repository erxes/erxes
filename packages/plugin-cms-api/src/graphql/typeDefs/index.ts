import { gql } from 'apollo-server-express';
import CmsTopic from './CmsTopic';
import CmsCategory from './CmsCategory';
import Query from './Query';
import Mutation from './Mutation';

export default async function genTypeDefs(serviceDiscovery) {
  return gql`
    scalar JSON
    scalar Date

    ${CmsTopic}
    ${CmsCategory}

    ${Query}
    ${Mutation}
  `;
}
