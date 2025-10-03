import { Team } from '@/team/graphql/resolvers/customResolvers/team';
import { TeamMember } from '@/team/graphql/resolvers/customResolvers/member';
import { Cycle } from '@/cycle/graphql/resolvers/customResolvers/cycle';

export const customResolvers = {
  Team,
  TeamMember,
  Cycle,
};
