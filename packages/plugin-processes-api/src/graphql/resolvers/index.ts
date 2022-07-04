import customScalars from '@erxes/api-utils/src/customScalars';

import JobCategory from './customResolver/jobCategory';
import FlowCategory from './customResolver/flowCategory';
import Flow from './customResolver/flowProduct';
import JobRefer from './customResolver/jobRefer';
import Work from './customResolver/work';
import OverallWork from './customResolver/overallWork';
import {
  JobRefers as JobRefersMutations,
  JobCategories as JobCategoryMutations,
  Flows as FlowsMutations,
  FlowCategories as FlowCategoryMutations,
  Works as WorkMutation,
  OverallWorks as OverallWorkMutations,
  Performs as PerformMutations
} from './mutations';

import {
  JobRefers as JobReferQueries,
  JobCategories as JobCategoryQueries,
  Flows as FlowQueries,
  FlowCategories as FlowCategoryQueries,
  Works as WorkQueries,
  OverallWorks as OverallWorkQueries,
  Performs as PerformQueries
} from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  JobCategory,
  FlowCategory,
  Flow,
  JobRefer,
  Work,
  OverallWork,
  Mutation: {
    ...JobRefersMutations,
    ...JobCategoryMutations,
    ...FlowsMutations,
    ...FlowCategoryMutations,
    ...WorkMutation,
    ...OverallWorkMutations,
    ...PerformMutations
  },
  Query: {
    ...JobReferQueries,
    ...JobCategoryQueries,
    ...FlowQueries,
    ...FlowCategoryQueries,
    ...WorkQueries,
    ...OverallWorkQueries,
    ...PerformQueries
  }
});

export default resolvers;
