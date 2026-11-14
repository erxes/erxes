import { isDefinedError } from '@orpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Label, Sheet, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { orpc } from '../orpc.ts';
import { type Item, useOpenItem } from './useItems.ts';

const textOf = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

/** A new item (`item` undefined) or a change to one. ITEM_NAME_TAKEN shows on the name field. */
const ItemForm = ({ item, onSaved }: { item?: Item; onSaved: () => void }) => {
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
    <form action={save} className="flex flex-1 flex-col">
      <Sheet.Content className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-name">{t('name', 'Name')}</Label>
          <Input
            id="item-name"
            name="name"
            required
            defaultValue={item?.name}
            aria-invalid={takenName !== null}
            aria-describedby={takenName === null ? undefined : 'item-name-error'}
          />
          {takenName !== null && (
            <p id="item-name-error" className="text-sm text-destructive">
              {t('name-taken', 'Another item is already called {{name}}.', { name: takenName })}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-description">{t('description', 'Description')}</Label>
          <Textarea id="item-description" name="description" defaultValue={item?.description} />
        </div>
        {error && !isDefinedError(error) && (
          <p role="alert" className="text-sm text-destructive">
            {error.message}
          </p>
        )}
      </Sheet.Content>
      <Sheet.Footer>
        <Button type="submit" disabled={isPending}>
          {t('save', 'Save')}
        </Button>
      </Sheet.Footer>
    </form>
  );
};

/** The side panel: a new item, or one from the list to change. */
export const ItemSheet = ({ items }: { items: Item[] }) => {
  const { t } = useTranslation('__id__');
  const { openId, close } = useOpenItem();
  const item = items.find((candidate) => candidate.id === openId);

  return (
    <Sheet open={Boolean(openId)} onOpenChange={(open) => !open && close()}>
      <Sheet.View className="sm:max-w-md">
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
          <ItemForm key={item?.id ?? 'new'} item={item} onSaved={close} />
        ) : (
          <Sheet.Content className="p-4 text-sm text-muted-foreground">
            {t('not-found', 'This item is not in the list.')}
          </Sheet.Content>
        )}
      </Sheet.View>
    </Sheet>
  );
};
