import { useQuery } from '@tanstack/react-query';
import { messageOf, orpc } from '~/lib/api';
import { memberName } from '~/lib/members';
import { tagsQuery } from '~/modules/tags/useTags';

/** Team members (any status) as picker options. */
export const useMemberOptions = (enabled = true) => {
  const query = useQuery(
    orpc.users.list.queryOptions({
      input: { limit: 100 },
      staleTime: 60_000,
      enabled,
      select: ({ data }) => data.map((user) => ({ value: user.id, label: memberName(user) })),
    }),
  );

  return { options: query.data ?? [], error: query.error };
};

/** A record type's tags as picker options. */
export const useTagOptions = (type: 'customer' | 'company', enabled = true) => {
  const query = useQuery({
    ...tagsQuery(type),
    enabled,
    select: ({ data }) => data.map((tag) => ({ value: tag.id, label: tag.name })),
  });

  return { options: query.data ?? [], error: query.error };
};

/** Why a picker's options are missing. */
export const LookupError = ({ error }: { error: Error | null }) =>
  error ? (
    <p role="alert" className="px-2 py-1.5 text-xs text-destructive">
      {messageOf(error)}
    </p>
  ) : null;
