import type { Tag } from '@erxes/core-contract';
import { IconCalendarPlus, IconLabelFilled, IconPalette, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecordTableColumnDef } from 'erxes-ui';
import {
  Button,
  cn,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextField,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { messageOf, orpc } from '~/lib/api';
import { TagDot } from '~/modules/tags/TagDot';
import { TAG_COLORS } from '~/modules/tags/useTags';

const useTagUpdate = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.tags.update.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.tags.key() }),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Could not save the tag',
          description: messageOf(error),
        }),
    }),
  );
};

const useTagRemove = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.tags.remove.mutationOptions({
      onSuccess: () =>
        Promise.all([
          client.invalidateQueries({ queryKey: orpc.tags.key() }),
          // Records lose the tag too.
          client.invalidateQueries({ queryKey: orpc.customers.key() }),
          client.invalidateQueries({ queryKey: orpc.companies.key() }),
        ]),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Could not delete the tag',
          description: messageOf(error),
        }),
    }),
  );
};

export const ColorSwatches = ({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (color: string) => void;
}) => (
  <div className="grid grid-cols-8 gap-1.5">
    {TAG_COLORS.map((color) => (
      <button
        key={color}
        type="button"
        aria-label={color}
        aria-pressed={value === color}
        onClick={() => onChange(color)}
        className={cn(
          'size-6 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
          value === color && 'ring-2 ring-primary',
        )}
        style={{ backgroundColor: color }}
      />
    ))}
  </div>
);

const ColorCell = ({ tag }: { tag: Tag }) => {
  const update = useTagUpdate();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        <TagDot color={tag.colorCode} className="size-3" />
      </RecordTableInlineCell.Trigger>
      <Popover.Content className="w-auto p-3">
        <ColorSwatches
          value={tag.colorCode}
          onChange={(colorCode) => {
            setOpen(false);
            update.mutate({ id: tag.id, colorCode });
          }}
        />
      </Popover.Content>
    </Popover>
  );
};

const NameCell = ({ tag }: { tag: Tag }) => {
  const update = useTagUpdate();

  return (
    <TextField
      scope={`core-tags.${tag.id}.name`}
      value={tag.name}
      placeholder="Name"
      onSave={(name) => name.trim() && update.mutate({ id: tag.id, name: name.trim() })}
    />
  );
};

const DeleteCell = ({ tag }: { tag: Tag }) => {
  const remove = useTagRemove();
  const { confirm } = useConfirm();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-full w-full rounded-none text-muted-foreground hover:text-destructive"
      aria-label={`Delete ${tag.name}`}
      onClick={() =>
        void confirm({
          message: `Delete the tag “${tag.name}”?`,
          options: {
            description: 'It is taken off every record that has it.',
            okLabel: 'Delete',
            variants: { ok: 'destructive' },
          },
        }).then(() => remove.mutate({ id: tag.id }))
      }
    >
      <IconTrash className="size-4" />
    </Button>
  );
};

const CreatedCell = ({ tag }: { tag: Tag }) => (
  <RelativeDateDisplay
    value={tag.createdAt}
    render={<RecordTableInlineCell className="text-xs font-medium text-muted-foreground" />}
  >
    <RelativeDateDisplay.Value value={tag.createdAt} />
  </RelativeDateDisplay>
);

const deleteColumn: RecordTableColumnDef<Tag> = {
  id: 'more',
  header: () => null,
  cell: ({ row }) => <DeleteCell tag={row.original} />,
  size: 33,
};

/** The tag table's columns; managers also get Delete. */
export const tagColumns = (manager: boolean): RecordTableColumnDef<Tag>[] => [
  ...(manager ? [deleteColumn] : []),
  {
    id: 'color',
    accessorKey: 'colorCode',
    header: () => <RecordTable.InlineHead icon={IconPalette} label="" />,
    cell: ({ row }) => <ColorCell tag={row.original} />,
    size: 40,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label="Name" />,
    cell: ({ row }) => <NameCell tag={row.original} />,
    size: 320,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendarPlus} label="Created" />,
    cell: ({ row }) => <CreatedCell tag={row.original} />,
  },
];
