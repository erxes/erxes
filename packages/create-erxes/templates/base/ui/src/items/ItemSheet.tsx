import { isDefinedError } from '@orpc/client';
import { type Icon, IconAlignLeft, IconLetterCase } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Sheet, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { orpc } from '../orpc.ts';
import { type Item, useOpenItem } from './useItems.ts';

const textOf = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

/** A new item (`item` undefined) or a change to one. ITEM_NAME_TAKEN shows on the name field. */
const ItemForm = ({
  item,
  onSaved,
  onCancel,
}: {
  item?: Item;
  onSaved: () => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('__id__');
  const queryClient = useQueryClient();

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.items.key() });
    onSaved();
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
    <form action={save} className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        <FormRow id="item-name" label={t('name', 'Name')} icon={IconLetterCase} required>
          <Input
            id="item-name"
            name="name"
            required
            defaultValue={item?.name}
            aria-invalid={takenName !== null}
            aria-describedby={takenName === null ? undefined : 'item-name-error'}
          />
        </FormRow>
        {takenName !== null && (
          <p id="item-name-error" className="text-xs text-destructive">
            {t('name-taken', 'Another item is already called {{name}}.', { name: takenName })}
          </p>
        )}
        <FormRow id="item-description" label={t('description', 'Description')} icon={IconAlignLeft}>
          <Textarea id="item-description" name="description" defaultValue={item?.description} />
        </FormRow>
        {error && !isDefinedError(error) && (
          <p role="alert" className="text-xs text-destructive">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex shrink-0 justify-end gap-1 border-t p-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {t('save', 'Save')}
        </Button>
      </div>
    </form>
  );
};

/** One field: its icon and label beside the control, as core's side panel lays them out. */
const FormRow = ({
  id,
  label,
  icon: RowIcon,
  required,
  children,
}: {
  id: string;
  label: string;
  icon: Icon;
  required?: boolean;
  children: ReactNode;
}) => (
  <div className="grid min-h-7 grid-cols-field items-center gap-x-2">
    <label
      htmlFor={id}
      className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-accent-foreground"
    >
      <RowIcon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
    </label>
    {children}
  </div>
);

/** The side panel: a new item, or one from the list to change. */
export const ItemSheet = ({ items }: { items: Item[] }) => {
  const { t } = useTranslation('__id__');
  const { openId, close } = useOpenItem();
  const item = items.find((candidate) => candidate.id === openId);

  return (
    <Sheet open={Boolean(openId)} onOpenChange={(open) => !open && close()}>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title>{item ? item.name : t('new-item', 'New item')}</Sheet.Title>
          <Sheet.Description className="sr-only">
            {item
              ? t('edit-item-hint', 'Change the name or the description.')
              : t('new-item-hint', 'Give it a name. The description is optional.')}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        {openId === 'new' || item ? (
          <ItemForm key={item?.id ?? 'new'} item={item} onSaved={close} onCancel={close} />
        ) : (
          <Sheet.Content>
            <p className="text-sm text-muted-foreground">
              {t('not-found', 'This item is not in the list.')}
            </p>
          </Sheet.Content>
        )}
      </Sheet.View>
    </Sheet>
  );
};
