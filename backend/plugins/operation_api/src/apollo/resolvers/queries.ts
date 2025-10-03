import { taskQueries } from '@/task/graphql/resolvers/queries/task';
import { projectQueries } from '@/project/graphql/resolvers/queries/project';
import { teamQueries } from '@/team/graphql/resolvers/queries/team';
import { statusQueries } from '@/status/graphql/resolvers/queries/status';
import { activityQueries } from '@/activity/graphql/resolvers/queries/activity';
import { noteQueries } from '@/note/graphql/resolvers/queries/note';
import { cycleQueries } from '@/cycle/graphql/resolvers/queries/cycle';

export const queries = {
  ...taskQueries,
  ...projectQueries,
  ...teamQueries,
  ...statusQueries,
  ...activityQueries,
  ...noteQueries,
  ...cycleQueries,
};
