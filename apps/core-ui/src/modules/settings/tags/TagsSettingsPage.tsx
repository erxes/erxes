import type { ContentType, Tag } from '@erxes/core-contract';
import {
  IconCalendarPlus,
  IconLabelFilled,
  IconPalette,
  IconPlus,
  IconTags,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Button,
  cn,
  Form,
  Input,
  PageContainer,
  PageSubHeader,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextField,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from 'erxes-ui';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { FormSheet } from '~/components/FormSheet';
import { api, messageOf } from '~/lib/api';
import { useCan, useSession } from '~/modules/auth/session';
import { TagDot } from '~/modules/tags/TagBadges';
import { TAG_COLORS, TAGS_KEY, useTagCreate, useTags } from '~/modules/tags/useTags';
import { ContentTypeSwitch, useContentTypeParam } from '../ContentTypeSwitch';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

const useTagUpdate = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; colorCode?: string | null }) =>
      api.tags.update({ id, ...body }),
    onSuccess: () => client.invalidateQueries({ queryKey: TAGS_KEY }),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: 'Could not save the tag',
        description: messageOf(error),
      }),
  });
};

const useTagRemove = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.tags.remove({ id }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: TAGS_KEY });
      // Records lose the tag too.
      void client.invalidateQueries({ queryKey: ['customers'] });
      void client.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: 'Could not delete the tag',
        description: messageOf(error),
      }),
  });
};

const ColorSwatches = ({
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

const ColorCell = ({ tag, editable }: { tag: Tag; editable: boolean }) => {
  const update = useTagUpdate();
  const [open, setOpen] = useState(false);

  if (!editable) {
    return (
      <RecordTableInlineCell>
        <TagDot color={tag.colorCode} className="size-3" />
      </RecordTableInlineCell>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTableInlineCell.Trigger>
          <TagDot color={tag.colorCode} className="size-3" />
        </RecordTableInlineCell.Trigger>
      </Popover.Trigger>
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
        confirm({
          message: `Delete the tag “${tag.name}”?`,
          options: {
            description: 'It is taken off every record that has it.',
            okLabel: 'Delete',
            variants: { ok: 'destructive' },
          },
        }).then(() => remove.mutate(tag.id))
      }
    >
      <IconTrash className="size-4" />
    </Button>
  );
};

const columns = (manager: boolean): ColumnDef<Tag>[] => [
  ...(manager
    ? [
        {
          id: 'more',
          header: () => null,
          cell: ({ row }) => <DeleteCell tag={row.original} />,
          size: 33,
        } as ColumnDef<Tag>,
      ]
    : []),
  {
    id: 'color',
    accessorKey: 'colorCode',
    header: () => <RecordTable.InlineHead icon={IconPalette} label="" />,
    cell: ({ row }) => <ColorCell tag={row.original} editable />,
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
    cell: ({ row }) => (
      <RelativeDateDisplay value={row.original.createdAt} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={row.original.createdAt} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];

const AddTag = ({ type }: { type: ContentType }) => {
  const [open, setOpen] = useState(false);
  const create = useTagCreate();
  const { tags } = useTags(type);

  const form = useForm<{ name: string; colorCode: string }>({
    defaultValues: { name: '', colorCode: TAG_COLORS[0] },
  });

  return (
    <>
      <Button
        onClick={() => {
          form.reset({ name: '', colorCode: TAG_COLORS[tags.length % TAG_COLORS.length] });
          setOpen(true);
        }}
      >
        <IconPlus />
        Add tag
      </Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title={`Add ${type} tag`}
        submitLabel="Create"
        submitting={create.isPending}
        onSubmit={form.handleSubmit(({ name, colorCode }) => {
          if (!name.trim()) {
            form.setError('name', { message: 'Enter a name' });

            return;
          }

          create.mutate(
            { type, name: name.trim(), colorCode },
            { onSuccess: () => setOpen(false) },
          );
        })}
      >
        <Form {...form}>
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Name</Form.Label>
                <Form.Control>
                  <Input {...field} autoFocus />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="colorCode"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Color</Form.Label>
                <ColorSwatches value={field.value} onChange={field.onChange} />
              </Form.Item>
            )}
          />
        </Form>
      </FormSheet>
    </>
  );
};

/** Settings › Tags: the tags for customers and for companies. */
export const TagsSettingsPage = () => {
  const [type] = useContentTypeParam();
  const { tags, loading } = useTags(type);
  const { user } = useSession();
  const manager = useCan()('tags.delete');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: 'Tags', to: CONTACT_SETTINGS.tags, icon: IconTags }]} />
        </PageHeader.Start>
        <PageHeader.End>
          <AddTag type={type} />
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="items-center">
        <ContentTypeSwitch />
        <span className="text-sm font-medium text-muted-foreground">{tags.length} tags</span>
      </PageSubHeader>
      <RecordTable.Provider
        key={`${type}-${manager}`}
        columns={columns(manager)}
        data={tags}
        className="m-3"
        tableId={`core_tags_${type}`}
      >
        <RecordTable.CursorProvider
          dataLength={tags.length}
          hasNextPage={false}
          hasPreviousPage={false}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading ? <RecordTable.RowSkeleton rows={8} /> : <RecordTable.RowList />}
            </RecordTable.Body>
          </RecordTable>
          {!loading && !tags.length && (
            <p className="py-10 text-center text-sm text-muted-foreground">No {type} tags yet.</p>
          )}
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </PageContainer>
  );
};
