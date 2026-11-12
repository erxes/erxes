import type { ActorRef, User } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { orpc } from './api';

export const memberName = (user: Pick<User, 'fullName' | 'email'>) => user.fullName || user.email;

/**
 * The active team, loaded once for the whole app: every member picker and
 * name lookup shares this one request and cache entry.
 */
export const activeMembersQuery = () =>
  orpc.users.list.queryOptions({ input: { limit: 100, status: 'active' }, staleTime: 60_000 });

/** Team members by id (any status), for showing who did something. */
export const useMembersById = (ids: (string | null | undefined)[]) => {
  // Only members outside the active team (disabled ones) are fetched by id.
  const team = useQuery(activeMembersQuery());

  const known = useMemo(() => new Set((team.data?.data ?? []).map((user) => user.id)), [team.data]);

  const wanted = useMemo(
    () =>
      [
        ...new Set(ids.filter((id): id is string => Boolean(id) && !known.has(id ?? ''))),
      ].toSorted(),
    [ids, known],
  );

  const query = useQuery(
    orpc.users.list.queryOptions({
      input: { ids: wanted.join(','), limit: 100 },
      enabled: team.isFetched && wanted.length > 0,
      staleTime: 5 * 60_000,
      // Names already shown stay while more are looked up.
      placeholderData: (previous) => previous,
    }),
  );

  return useMemo(
    () =>
      new Map(
        [...(team.data?.data ?? []), ...(query.data?.data ?? [])].map((user) => [user.id, user]),
      ),
    [team.data, query.data],
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

    return member ? memberName(member) : actor.name || unknownMember;
  }

  if (actor.type === 'plugin') {
    return actor.id ? pluginLabel(actor.id) : 'A plugin';
  }

  return 'erxes';
};
