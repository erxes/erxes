import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import CategoryQueries from './CategoryQueries';

const Query: IObjectTypeResolver<any, IContext> = {
  ...CategoryQueries
};

export default Query;
