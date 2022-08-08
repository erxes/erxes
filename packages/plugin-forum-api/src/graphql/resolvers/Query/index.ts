import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import categoryQueries from './categoryQueries';
import postQueries from './postQueries';
const Query: IObjectTypeResolver<any, IContext> = {
  ...categoryQueries,
  ...postQueries
};

export default Query;
