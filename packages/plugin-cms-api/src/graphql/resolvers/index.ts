import customScalars from '@erxes/api-utils/src/customScalars';
import mutations from './mutations';
import queries from './queries';
import { Page } from './page';
import Post from './post';
import { CustomFieldGroup } from './fieldGroup';
import {PostCategory} from './category';

const resolvers: any = async () => ({
  ...customScalars,
  Post,
  Page,
  PostCategory,
  
  CustomFieldGroup,
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
