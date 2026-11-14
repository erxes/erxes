import { skipToken, useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';
import { Combobox, EntityPicker, memberName, Popover } from 'erxes-ui';
import { useState } from 'react';
import { tagsQuery } from '~/modules/tags/useTags';

/** Team members (any status) as picker options. */
export const useMemberOptions = (enabled = true) => {
  const query = useQuery(
    orpc.users.list.queryOptions({
      input: enabled ? { limit: 100 } : skipToken,
      staleTime: 60_000,
      select: ({ data }) => data.map((user) => ({ value: user.id, label: memberName(user) })),
    }),
  );

  return { options: query.data ?? [], loading: query.isPending, error: query.error };
};

/** A record type's tags as picker options. */
export const useTagOptions = (type: 'customer' | 'company', enabled = true) => {
  const query = useQuery({
    ...tagsQuery(enabled ? type : skipToken),
    select: ({ data }) => data.map((tag) => ({ value: tag.id, label: tag.name })),
  });

  return { options: query.data ?? [], loading: query.isPending, error: query.error };
};

type LookupOptions = ReturnType<typeof useMemberOptions>;

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
