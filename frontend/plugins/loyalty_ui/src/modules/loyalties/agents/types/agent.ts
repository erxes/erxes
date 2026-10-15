import type { AgentStatus, AgentsMainQuery } from '~/gql/graphql';

export type IAgent = NonNullable<
  NonNullable<NonNullable<AgentsMainQuery['agentsMain']>['list']>[number]
>;

const AGENT_STATUSES: AgentStatus[] = ['active', 'draft', 'archived'];

export const toAgentStatus = (value: string): AgentStatus =>
  AGENT_STATUSES.find((status) => status === value) ?? 'draft';
