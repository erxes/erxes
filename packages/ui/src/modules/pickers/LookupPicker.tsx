import { skipToken, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Combobox } from '../../components/combobox';
import { Popover } from '../../components/popover';
import { EntityPicker } from './EntityPicker';
import { type Member, type MemberQueries, memberName } from './members';

/** A tag as the pickers show one: core's `Tag` has these fields and more. */
export interface Tag {
  id: string;
  name: string;
}

/**
 * The tags of one record type, as TanStack query options: in erxes, web's query for
 * `orpc.tags.list` with the type (`{ type: 'customer' }`).
 */
export type TagsQuery = RowsQuery<Tag>;

type LookupOptions = {
  options: { value: string; label: string }[];
  loading: boolean;
  error: Error | null;
};

type RowsQuery<T> = UseQueryOptions<{ data: T[] }, Error, { data: T[] }>;

const useLookup = <T,>(
  query: RowsQuery<T> | undefined,
  enabled: boolean,
  option: (row: T) => { value: string; label: string },
): LookupOptions => {
  // A lookup the screen didn't give: no options, no request.
  const options: RowsQuery<T> = query
    ? { ...query, enabled }
    : { queryKey: ['erxes-ui', 'no-lookup'], queryFn: skipToken };

  const result = useQuery(options);
  const rows = useMemo(() => (result.data?.data ?? []).map(option), [result.data, option]);

  return { options: rows, loading: enabled && !!query && result.isPending, error: result.error };
};

const memberOption = (member: Member) => ({
  value: member.id,
  label: memberName(member),
});

const tagOption = (tag: Tag) => ({ value: tag.id, label: tag.name });

/** The active team as picker options; none without `members`. */
export const useMemberOptions = (members: MemberQueries | undefined, enabled = true) =>
  useLookup(members?.team, enabled, memberOption);

/** A record type's tags as picker options; none without `tags`. */
export const useTagOptions = (tags: TagsQuery | undefined, enabled = true) =>
  useLookup(tags, enabled, tagOption);

/** One option, or several with `multiple`, from members or tags, on a button. */
export const LookupPicker = ({
  lookup: { options, loading, error },
  value,
  onValueChange,
  multiple,
  placeholder,
  disabled,
  className,
}: {
  lookup: LookupOptions;
  value: string[];
  onValueChange: (values: string[]) => void;
  multiple?: boolean;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  // A picked id that no longer loads (a deleted tag, a member past the first page) stays as a
  // row under its id, so it can still be unpicked.
  const missing = value
    .filter((id) => !options.some((option) => option.value === id))
    .map((id) => ({ value: id, label: id }));

  const items = [...missing, ...options];
  const labels = value.map((id) => items.find((option) => option.value === id)?.label ?? id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger disabled={disabled} className={className}>
        <Combobox.Value value={labels.join(', ')} placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <EntityPicker
          multiple={multiple}
          items={items}
          itemKey={(option) => ({ id: option.value, label: option.label })}
          value={value}
          onValueChange={(next) => {
            onValueChange(next);

            if (!multiple) setOpen(false);
          }}
          loading={loading}
          error={error}
        />
      </Combobox.Content>
    </Popover>
  );
};
