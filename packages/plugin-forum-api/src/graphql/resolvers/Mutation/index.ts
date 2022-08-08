import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import categoryMutations from './categoryMutations';
import postMutations from './postMutations';

const Mutation: IObjectTypeResolver<any, IContext> = {
  ...categoryMutations,
  ...postMutations
};

export default Mutation;
