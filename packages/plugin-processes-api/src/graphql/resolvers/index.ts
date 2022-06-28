import customScalars from '@erxes/api-utils/src/customScalars';

import JobCategory from './customResolver/jobCategory';
import FlowCategory from './customResolver/flowCategory';
import FlowProduct from './customResolver/flowProduct';
import JobReferNeedResultProduct from './customResolver/needResultProducts';
import {
  JobRefers as JobRefersMutations,
  JobCategories as JobCategoryMutations,
  Flows as FlowsMutations,
  FlowCategories as FlowCategoryMutations,
  Works as WorkMutation,
  OverallWorks as OverallWorkMutations
} from './mutations';

import {
  JobRefers as JobReferQueries,
  JobCategories as JobCategoryQueries,
  Flows as FlowQueries,
  FlowCategories as FlowCategoryQueries,
  Works as WorkQueries,
  OverallWorks as OverallWorkQueries
} from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  JobCategory,
  FlowCategory,
  Flow: FlowProduct,
  JobRefer: JobReferNeedResultProduct,
  Mutation: {
    ...JobRefersMutations,
    ...JobCategoryMutations,
    ...FlowsMutations,
    ...FlowCategoryMutations,
    ...WorkMutation,
    ...OverallWorkMutations
  },
  Query: {
    ...JobReferQueries,
    ...JobCategoryQueries,
    ...FlowQueries,
    ...FlowCategoryQueries,
    ...WorkQueries,
    ...OverallWorkQueries
  }
});

export default resolvers;
