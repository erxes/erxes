import { apolloCustomScalars } from 'erxes-api-shared/utils';
import {
  dataExtensionMutations,
  dataExtensionQueries,
} from '@/data-extensions/graphql/resolvers';

export const resolvers: any = {
  Query: { ...dataExtensionQueries },
  Mutation: { ...dataExtensionMutations },
  ...apolloCustomScalars,
};
