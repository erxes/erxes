import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import CategoryMutations from './CategoryMutations';

const Mutation: IObjectTypeResolver<any, IContext> = {
  ...CategoryMutations
};

export default Mutation;
