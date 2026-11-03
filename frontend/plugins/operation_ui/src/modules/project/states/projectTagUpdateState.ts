import type { ApolloClient } from '@apollo/client';
import { atom, type PrimitiveAtom } from 'jotai';

interface ProjectTagUpdates {
  pendingTagIds: PrimitiveAtom<string[] | null>;
  queue: Promise<void>;
  version: number;
}

const projectTagUpdates = new WeakMap<
  ApolloClient<object>,
  Map<string, ProjectTagUpdates>
>();

/** Keeps pending tag selections and save order across project cell remounts. */
export const getProjectTagUpdates = (
  client: ApolloClient<object>,
  projectId: string,
): ProjectTagUpdates => {
  let projects = projectTagUpdates.get(client);
  if (!projects) {
    projects = new Map();
    projectTagUpdates.set(client, projects);
  }

  let updates = projects.get(projectId);
  if (!updates) {
    updates = {
      pendingTagIds: atom<string[] | null>(null),
      queue: Promise.resolve(),
      version: 0,
    };
    projects.set(projectId, updates);
  }

  return updates;
};
