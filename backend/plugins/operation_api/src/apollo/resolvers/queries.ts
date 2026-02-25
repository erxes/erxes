import { activityQueries } from '@/activity/graphql/resolvers/queries/activity';
import { cycleQueries } from '@/cycle/graphql/resolvers/queries/cycle';
import { milestoneQueries } from '@/milestone/graphql/resolvers/queries/milestone';
import { noteQueries } from '@/note/graphql/resolvers/queries/note';
import { projectQueries } from '@/project/graphql/resolvers/queries/project';
import { statusQueries } from '@/status/graphql/resolvers/queries/status';
import { taskQueries } from '@/task/graphql/resolvers/queries/task';
import { teamQueries } from '@/team/graphql/resolvers/queries/team';
import { triageQueries } from '@/task/graphql/resolvers/queries/triage';
import { queries as templateQueries } from '@/template/graphql/resolvers';

export const queries = {
  ...taskQueries,
  ...projectQueries,
  ...teamQueries,
  ...statusQueries,
  ...activityQueries,
  ...noteQueries,
  ...cycleQueries,
  ...milestoneQueries,
  ...triageQueries,
  ...templateQueries,
};
