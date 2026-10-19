import { createApi, type InputOf, type OutputOf } from 'erxes-sdk/react';
import { REACT_APP_API_URL } from 'erxes-ui';
import type * as server from '../../server';

// Refs to the server's functions: api.agents.list, api.agents.add. Typed from
// server/ through a type-only import, so no server code reaches the browser.
export const api = createApi<typeof server>({
  apiUrl: REACT_APP_API_URL,
  extId: 'loyalty-agents',
});

export const PER_PAGE = 20;

export type StoredAgent = OutputOf<typeof api.agents.list>['list'][number];
export type AgentStatus = StoredAgent['status'];
export type AgentInput = InputOf<typeof api.agents.add>;

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';
