import { keepPreviousData, skipToken, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/** A team member as the pickers show one. Core's `User` has these fields and more. */
export interface Member {
  id: string;
  /** Empty for a member who doesn't sign in. */
  email: string | null;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  status: string;
}

type MemberQuery = UseQueryOptions<{ data: Member[] }, Error, { data: Member[] }>;

/**
 * Where members come from, as TanStack query options. erxes-ui knows nothing of core: web and
 * plugin UIs pass `memberQueries` from `@erxes/core-contract/client`.
 */
export interface MemberQueries {
  /** The active team: every picker's list, and the names most screens show. */
  team: MemberQuery;
  /** Members by id, for those outside the active team (disabled ones). */
  byIds: (ids: string[]) => MemberQuery;
  /** The signed-in member, whom pickers list first; in core, `orpc.auth.me`. */
  me?: UseQueryOptions<{ user: Pick<Member, 'id'> }, Error, { user: Pick<Member, 'id'> }>;
}

/** The members with `meId` moved to the top: most picks are your own. */
export const meFirst = <T extends Pick<Member, 'id'>>(
  items: T[],
  meId: string | null | undefined,
) => {
  const me = items.find((item) => item.id === meId);

  return me ? [me, ...items.filter((item) => item !== me)] : items;
};

/** The signed-in member's id, when `members` says how to read it. */
export const useMeId = (members: MemberQueries) =>
  useQuery(members.me ?? { queryKey: ['erxes-ui', 'no-me'], queryFn: skipToken }).data?.user.id;

/** How a member reads: the display name, else the username, else the email. */
export const memberName = (member: Pick<Member, 'fullName' | 'username' | 'email'>) =>
  member.fullName || member.username || member.email || '';

/** Members by id, any status. The active team answers most; only the rest are fetched. */
export const useMembersById = (ids: (string | null | undefined)[], members: MemberQueries) => {
  const team = useQuery(members.team);

  const known = useMemo(() => new Set((team.data?.data ?? []).map((user) => user.id)), [team.data]);

  const wanted = useMemo(
    () =>
      [...new Set(ids.filter((id): id is string => Boolean(id) && !known.has(id ?? '')))].toSorted(
        (a, b) => a.localeCompare(b),
      ),
    [ids, known],
  );

  const others = useQuery({
    ...members.byIds(wanted),
    enabled: team.isFetched && wanted.length > 0,
    // Names already shown stay while more are looked up.
    placeholderData: keepPreviousData,
  });

  return useMemo(
    () =>
      new Map(
        [...(team.data?.data ?? []), ...(others.data?.data ?? [])].map((user) => [user.id, user]),
      ),
    [team.data, others.data],
  );
};
