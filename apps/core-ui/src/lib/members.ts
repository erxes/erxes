import type { ActorRef, User } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { api } from './api';

export const memberName = (user: Pick<User, 'fullName' | 'email'>) => user.fullName || user.email;

/** Team members by id (any status), for showing who did something. */
export const useMembersById = (ids: (string | null | undefined)[]) => {
  const wanted = useMemo(
    () => [...new Set(ids.filter((id): id is string => Boolean(id)))].sort(),
    [ids],
  );
  const query = useQuery({
    queryKey: ['users', 'by-id', wanted],
    queryFn: () => api.users.list({ ids: wanted.join(','), limit: 100 }),
    enabled: wanted.length > 0,
    staleTime: 5 * 60_000,
  });

  return useMemo(
    () => new Map((query.data?.data ?? []).map((user) => [user.id, user])),
    [query.data],
  );
};

/** A plugin name as people read it: `hr` → `HR`, `ecom` → `Ecom`. */
export const pluginLabel = (name: string) =>
  name.length <= 3 ? name.toUpperCase() : name.charAt(0).toUpperCase() + name.slice(1);

/** Who did it, in words. */
export const actorLabel = (
  actor: ActorRef,
  members: Map<string, User>,
  unknownMember = 'A team member',
) => {
  if (actor.type === 'user') {
    const member = actor.id ? members.get(actor.id) : undefined;

    return member ? memberName(member) : unknownMember;
  }

  if (actor.type === 'plugin') {
    return actor.id ? pluginLabel(actor.id) : 'A plugin';
  }

  return 'erxes';
};
