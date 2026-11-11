import type { ContentType, Field } from '@erxes/core-contract';
import { FieldType } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconAdjustmentsHorizontal, IconCategory, IconLabelFilled, IconList, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Button,
  Form,
  Input,
  PageContainer,
  PageSubHeader,
  RecordTable,
  RecordTableInlineCell,
  Select,
  Textarea,
  TextField,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from 'ui-modules';
import { z } from 'zod';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { FormSheet } from '~/components/FormSheet';
import { api, messageOf } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { FIELD_TYPE_ICONS, FIELD_TYPE_LABELS } from '~/modules/properties/CustomFieldCell';
import { FIELDS_KEY, useFields } from '~/modules/properties/useFields';
import { ContentTypeSwitch, useContentTypeParam } from '../ContentTypeSwitch';

const hasOptions = (type: Field['type']) => type === 'select' || type === 'multiselect';

/** Options typed one per line or separated by commas. */
const parseOptions = (text: string) =>
  [...new Set(text.split(/[\n,]/).map((option) => option.trim()).filter(Boolean))];

const useFieldMutations = () => {
  const client = useQueryClient();
  const { toast } = useToast();
  const refresh = () => client.invalidateQueries({ queryKey: FIELDS_KEY });
  const failed = (title: string) => (error: unknown) =>
    toast({ variant: 'destructive', title, description: messageOf(error) });

  return {
    create: useMutation({
      mutationFn: (body: { contentType: ContentType; label: string; type: Field['type']; options?: string[] }) =>
        api.fields.create(body),
      onSuccess: refresh,
      onError: failed('Could not add the property'),
    }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: string; label?: string; options?: string[] }) =>
        api.fields.update({ id, ...body }),
      onSuccess: refresh,
      onError: failed('Could not save the property'),
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.fields.remove({ id }),
      onSuccess: () => {
        void refresh();
        void client.invalidateQueries({ queryKey: ['customers'] });
        void client.invalidateQueries({ queryKey: ['companies'] });
      },
      onError: failed('Could not delete the property'),
    }),
  };
};

const LabelCell = ({ field, editable }: { field: Field; editable: boolean }) => {
  const { update } = useFieldMutations();

  if (!editable) {
    return <RecordTableInlineCell>{field.label}</RecordTableInlineCell>;
  }

  return (
    <TextField
      scope={`core-fields.${field.id}.label`}
      value={field.label}
      placeholder="Label"
      onSave={(label) => label.trim() && update.mutate({ id: field.id, label: label.trim() })}
    />
  );
};

const OptionsCell = ({ field, editable }: { field: Field; editable: boolean }) => {
  const { update } = useFieldMutations();

  if (!hasOptions(field.type)) {
    return <RecordTableInlineCell className="text-muted-foreground">—</RecordTableInlineCell>;
  }

  if (!editable) {
    return <RecordTableInlineCell>{field.options.join(', ')}</RecordTableInlineCell>;
  }

  return (
    <TextField
      scope={`core-fields.${field.id}.options`}
      value={field.options.join(', ')}
      placeholder="Comma-separated options"
      onSave={(text) => {
        const options = parseOptions(text);

        if (options.length) update.mutate({ id: field.id, options });
      }}
    />
  );
};

const DeleteCell = ({ field }: { field: Field }) => {
  const { remove } = useFieldMutations();
  const { confirm } = useConfirm();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-full w-full rounded-none text-muted-foreground hover:text-destructive"
      aria-label={`Delete ${field.label}`}
      onClick={() =>
        confirm({
          message: `Delete the property “${field.label}”?`,
          options: {
            description: 'Its values are removed from every record.',
            okLabel: 'Delete',
            variants: { ok: 'destructive' },
          },
        }).then(() => remove.mutate(field.id))
      }
    >
      <IconTrash className="size-4" />
    </Button>
  );
};

const columns = (manager: boolean): ColumnDef<Field>[] => [
  ...(manager
    ? [{ id: 'more', header: () => null, cell: ({ row }) => <DeleteCell field={row.original} />, size: 33 } as ColumnDef<Field>]
    : []),
  {
    id: 'label',
    accessorKey: 'label',
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label="Label" />,
    cell: ({ row }) => <LabelCell field={row.original} editable={manager} />,
    size: 260,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconCategory} label="Type" />,
    cell: ({ row }) => {
      const Icon = FIELD_TYPE_ICONS[row.original.type];

      return (
        <RecordTableInlineCell className="gap-2">
          <Icon className="size-4 text-muted-foreground" />
          {FIELD_TYPE_LABELS[row.original.type]}
        </RecordTableInlineCell>
      );
    },
    size: 160,
  },
  {
    id: 'options',
    accessorKey: 'options',
    header: () => <RecordTable.InlineHead icon={IconList} label="Options" />,
    cell: ({ row }) => <OptionsCell field={row.original} editable={manager} />,
    size: 360,
  },
];

const schema = z.object({
  label: z.string().trim().min(1, 'Enter a label').max(100),
  type: FieldType,
  options: z.string(),
});

type Values = z.infer<typeof schema>;

const AddProperty = ({ contentType }: { contentType: ContentType }) => {
  const [open, setOpen] = useState(false);
  const { create } = useFieldMutations();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: '', type: 'text', options: '' },
  });
  const type = form.watch('type');

  return (
    <>
      <Button
        onClick={() => {
          form.reset({ label: '', type: 'text', options: '' });
          setOpen(true);
        }}
      >
        <IconPlus />
        Add property
      </Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title={`Add ${contentType} property`}
        description="A field every record of this type gets, shown as a column and in the record."
        submitLabel="Create"
        submitting={create.isPending}
        onSubmit={form.handleSubmit((values) => {
          const options = parseOptions(values.options);

          if (hasOptions(values.type) && !options.length) {
            form.setError('options', { message: 'Add at least one option' });
            return;
          }

          create.mutate(
            {
              contentType,
              label: values.label,
              type: values.type,
              options: hasOptions(values.type) ? options : undefined,
            },
            { onSuccess: () => setOpen(false) },
          );
        })}
      >
        <Form {...form}>
          <Form.Field
            name="label"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Label</Form.Label>
                <Form.Control>
                  <Input {...field} autoFocus />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="type"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Type</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    {FieldType.options.map((option) => (
                      <Select.Item key={option} value={option}>
                        {FIELD_TYPE_LABELS[option]}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
          {hasOptions(type) && (
            <Form.Field
              name="options"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Options</Form.Label>
                  <Form.Control>
                    <Textarea {...field} rows={5} placeholder={'One per line\nBronze\nSilver\nGold'} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          )}
        </Form>
      </FormSheet>
    </>
  );
};

/** Settings › Properties: custom fields for customers and for companies. */
export const PropertiesPage = () => {
  const [contentType] = useContentTypeParam();
  const { fields, loading } = useFields(contentType);
  const { user } = useSession();
  const manager = user.role !== 'member';

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: 'Properties', to: '/settings/properties', icon: IconAdjustmentsHorizontal }]}
          />
        </PageHeader.Start>
        <PageHeader.End>{manager && <AddProperty contentType={contentType} />}</PageHeader.End>
      </PageHeader>
      <PageSubHeader className="items-center">
        <ContentTypeSwitch />
        <span className="text-sm font-medium text-muted-foreground">{fields.length} properties</span>
      </PageSubHeader>
      <RecordTable.Provider
        key={`${contentType}-${manager}`}
        columns={columns(manager)}
        data={fields}
        className="m-3"
        tableId={`core_fields_${contentType}`}
      >
        <RecordTable.CursorProvider dataLength={fields.length} hasNextPage={false} hasPreviousPage={false}>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading ? <RecordTable.RowSkeleton rows={6} /> : <RecordTable.RowList />}
            </RecordTable.Body>
          </RecordTable>
          {!loading && !fields.length && (
            <p className="py-10 text-center text-sm text-muted-foreground">No {contentType} properties yet.</p>
          )}
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </PageContainer>
  );
};
