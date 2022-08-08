import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import categoryQueries from './categoryQueries';
import postQueries from './postQueries';
import commentQueries from './commentQueries';
const Query: IObjectTypeResolver<any, IContext> = {
  ...categoryQueries,
  ...postQueries,
  ...commentQueries
};

export default Query;
