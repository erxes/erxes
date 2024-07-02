import customScalars from '@erxes/api-utils/src/customScalars';
import customResolvers from './customResolvers';

import {
  Template as TemplateQueries,
  Category as CategoryQueries
} from './queries'

import {
  Template as TemplateMutations,
  Category as CategoryMutations
} from './mutations'

const resolvers: any = async () => {

  return {
    ...customScalars,
    ...customResolvers,

    Mutation: {
      ...TemplateMutations,
      ...CategoryMutations
    },
    Query: {
      ...TemplateQueries,
      ...CategoryQueries
    }
  }
};


export default resolvers;
