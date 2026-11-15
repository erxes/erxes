import { isDefinedError } from '@orpc/client';
import { IconAlignLeft, IconLetterCase } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Input,
  PanelFormLayout,
  PanelFormRow,
  PanelSection,
  Skeleton,
  Spinner,
  Textarea,
  type TRecordDraftProps,
  type TRecordSlotProps,
} from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { orpc } from '~/orpc.ts';
import type { Item } from './useItems.ts';

const textOf = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

/**
 * An item's fields in core's form rows: a new one (`item` undefined) or a change to one.
 * Nothing saves until Save; ITEM_NAME_TAKEN shows under the name.
 */
const ItemForm = ({
  item,
  onSaved,
  onCancel,
}: {
  item?: Item;
  onSaved?: (item: Item) => void;
  /** Without it, Cancel puts the fields back. */
  onCancel?: () => void;
}) => {
  const { t } = useTranslation('__id__');
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  const onSuccess = (saved: Item) => {
    void queryClient.invalidateQueries({ queryKey: orpc.items.key() });
    onSaved?.(saved);
  };

  const create = useMutation(orpc.items.create.mutationOptions({ onSuccess }));
  const update = useMutation(orpc.items.update.mutationOptions({ onSuccess }));
  const { error, isPending } = item ? update : create;

  const takenName =
    isDefinedError(error) && error.code === 'ITEM_NAME_TAKEN' ? error.data.name : null;

  const save = (form: FormData) => {
    const fields = {
      name: textOf(form.get('name')),
      description: textOf(form.get('description')),
    };

    if (item) update.mutate({ id: item.id, ...fields });
    else create.mutate(fields);
  };

  return (
    <form ref={formRef} action={save} className="flex min-h-0 flex-1 flex-col">
      <PanelFormLayout
        onCancel={onCancel ?? (() => formRef.current?.reset())}
        saving={isPending}
        saveLabel={item ? t('save', 'Save') : t('create', 'Create item')}
      >
        <PanelFormRow
          label={t('name', 'Name')}
          icon={IconLetterCase}
          required
          error={
            takenName === null
              ? undefined
              : t('name-taken', 'Another item is already called {{name}}.', { name: takenName })
          }
        >
          <Input
            name="name"
            required
            defaultValue={item?.name}
            placeholder={t('name', 'Name')}
            aria-invalid={takenName !== null}
            variant="bordered"
            text="sm"
          />
        </PanelFormRow>
        <PanelFormRow label={t('description', 'Description')} icon={IconAlignLeft}>
          <Textarea name="description" defaultValue={item?.description} />
        </PanelFormRow>
        {error && !isDefinedError(error) && (
          <p role="alert" className="text-xs text-destructive">
            {error.message}
          </p>
        )}
      </PanelFormLayout>
    </form>
  );
};

/** A new item in core's side panel, under its "New item" header; Save puts the item in its place. */
export const ItemNew = ({ onCreated, onCancel }: TRecordDraftProps) => (
  <ItemForm onSaved={(item) => onCreated(item.id)} onCancel={onCancel} />
);

/** The item the panel shows; its slots share this one query. */
const useItem = (contentId: string) =>
  useQuery(orpc.items.get.queryOptions({ input: { id: contentId } }));

/** The panel header's title: the item's name. */
export const ItemTitle = ({ contentId }: TRecordSlotProps) => {
  const item = useItem(contentId);

  if (item.isPending) return <Skeleton className="h-4 w-32" />;

  return <span className="truncate">{item.data?.name ?? item.error?.message}</span>;
};

/** The Detail tab: the item's fields, changed in place and saved with Save. */
export const ItemDetail = ({ contentId }: TRecordSlotProps) => {
  const { t } = useTranslation('__id__');
  const item = useItem(contentId);

  if (item.isPending) return <Spinner area="lg" />;

  if (item.isError) {
    return (
      <p role="alert" className="p-3 text-xs text-destructive">
        {item.error.message}
      </p>
    );
  }

  return (
    <PanelSection title={t('item', 'Item')}>
      <ItemForm item={item.data} />
    </PanelSection>
  );
};
