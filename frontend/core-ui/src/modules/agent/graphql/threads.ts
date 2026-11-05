import { gql } from '@apollo/client';

import type { IAgentsThread, IStoredMessage } from '../types';

/**
 * GraphQL documents for the agents thread history surface.
 *
 * Operation names are prefixed with `Agents` to stay unique repo-wide. The
 * `AgentsThreadsChanged` subscription is consumed purely as a refetch
 * signal: it fires when a chat turn is persisted and again when a thread
 * title is generated.
 */

export const AGENTS_THREADS = gql`
  query AgentsThreads($page: Int, $perPage: Int) {
    agentsThreads(page: $page, perPage: $perPage) {
      threads {
        id
        title
        pinned
        createdAt
        updatedAt
      }
      total
      page
      perPage
      hasMore
    }
  }
`;

export const AGENTS_PINNED_THREADS = gql`
  query AgentsPinnedThreads {
    agentsThreads(pinned: true, perPage: 100) {
      threads {
        id
        title
        pinned
        createdAt
        updatedAt
      }
      total
      page
      perPage
      hasMore
    }
  }
`;

export const AGENTS_THREAD_DETAIL = gql`
  query AgentsThreadDetail($threadId: String!) {
    agentsThreadDetail(threadId: $threadId) {
      thread {
        id
        title
        createdAt
        updatedAt
      }
      messages {
        id
        role
        createdAt
        content
      }
    }
  }
`;

export const AGENTS_THREAD_UPDATE = gql`
  mutation AgentsThreadUpdate(
    $threadId: String!
    $title: String
    $pinned: Boolean
  ) {
    agentsThreadUpdate(threadId: $threadId, title: $title, pinned: $pinned) {
      id
      title
      pinned
      createdAt
      updatedAt
    }
  }
`;

export const AGENTS_THREAD_REMOVE = gql`
  mutation AgentsThreadRemove($threadId: String!) {
    agentsThreadRemove(threadId: $threadId)
  }
`;

export const AGENTS_THREADS_CHANGED = gql`
  subscription AgentsThreadsChanged {
    agentsThreadsChanged {
      userId
    }
  }
`;

export interface IAgentsThreadsData {
  agentsThreads: {
    threads: IAgentsThread[];
    total: number;
    page: number;
    perPage: number;
    hasMore: boolean;
  } | null;
}

export interface IAgentsThreadDetailData {
  agentsThreadDetail: {
    thread: IAgentsThread;
    messages: IStoredMessage[];
  } | null;
}

export interface IAgentsThreadUpdateData {
  agentsThreadUpdate: IAgentsThread | null;
}

export interface IAgentsThreadUpdateVariables {
  threadId: string;
  title?: string;
  pinned?: boolean;
}

export interface IAgentsThreadRemoveData {
  agentsThreadRemove: boolean;
}

export interface IAgentsThreadRemoveVariables {
  threadId: string;
}
