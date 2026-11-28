import type { DataExtensionObject } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, Input, Spinner } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRefreshDataModel } from '../dataQueries';
import { FormError } from '../form/DraftEditor';
import { useDataErrorText } from '../useDataErrors';
import { IconRow, KeyAndDescription, SettingRow } from './SettingRow';

/** `Project tasks` → `project_tasks`: what a new object's key starts as. */
const keyOf = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^[^a-z]+|_+$/g, '')
    .slice(0, 40);

interface ObjectDraft {
  singularLabel: string;
  pluralLabel: string;
  key: string;
  description: string;
  icon: string | null;
}

/** Creates the object, or saves an existing one's changes; `onDone` once the lists refetch. */
const useObjectSave = (object: DataExtensionObject | undefined, onDone: () => void) => {
  const refresh = useRefreshDataModel();
  const errorText = useDataErrorText();
  const handlers = { onSuccess: () => void refresh().then(onDone) };
  const create = useMutation(orpc.dataObjects.create.mutationOptions(handlers));
  const update = useMutation(orpc.dataObjects.update.mutationOptions(handlers));
  const error = create.error ?? update.error;

  const save = ({ description, icon, ...draft }: ObjectDraft) =>
    object
      ? update.mutate({ ...draft, key: object.key, description: description || null, icon })
      : create.mutate({ ...draft, description: description || undefined, icon: icon ?? undefined });

  return { save, saving: create.isPending || update.isPending, error: error && errorText(error) };
};

/** The form, mounted while the dialog is open so closing it clears what was typed. */
const ObjectForm = ({ object, onDone }: { object?: DataExtensionObject; onDone: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'objects' });
  const ids = { singular: useId(), plural: useId() };
  const { save, saving, error } = useObjectSave(object, onDone);

  const [draft, setDraft] = useState<ObjectDraft>({
    singularLabel: object?.singularLabel ?? '',
    pluralLabel: object?.pluralLabel ?? '',
    key: object?.key ?? '',
    description: object?.description ?? '',
    icon: object?.icon ?? null,
  });

  const set = (patch: Partial<ObjectDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const ready = draft.singularLabel.trim() && draft.pluralLabel.trim() && draft.key;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save(draft);
      }}
    >
      <FormError message={error} />
      <IconRow icon={draft.icon} onIconChange={(icon) => set({ icon })}>
        <SettingRow label={t('singular', 'One of them')} htmlFor={ids.singular}>
          <Input
            id={ids.singular}
            value={draft.singularLabel}
            placeholder={t('singular-placeholder', 'Project')}
            onChange={({ target }) =>
              set({ singularLabel: target.value, ...(object ? {} : { key: keyOf(target.value) }) })
            }
          />
        </SettingRow>
      </IconRow>
      <SettingRow label={t('plural', 'A list of them')} htmlFor={ids.plural}>
        <Input
          id={ids.plural}
          value={draft.pluralLabel}
          placeholder={t('plural-placeholder', 'Projects')}
          onChange={({ target }) => set({ pluralLabel: target.value })}
        />
      </SettingRow>
      <KeyAndDescription
        keyValue={draft.key}
        keyHint={t(
          'key-hint',
          'Lower case letters, digits and _. It names the table and never changes.',
        )}
        keyLocked={Boolean(object)}
        description={draft.description}
        onKeyChange={(key) => set({ key })}
        onDescriptionChange={(description) => set({ description })}
      />
      <Button type="submit" disabled={saving || !ready}>
        {saving && <Spinner size="sm" />}
        {object ? t('save', 'Save') : t('create', 'Add object')}
      </Button>
    </form>
  );
};

/** Adds a custom object, or edits one's labels, icon and description. */
export const ObjectDialog = ({
  object,
  open,
  onOpenChange,
}: {
  object?: DataExtensionObject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'objects' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={object ? t('edit', 'Edit object') : t('add', 'Add object')}
          description={t(
            'add-description',
            'An object is a record type of your own, with its own fields and list. It starts with a Name field.',
          )}
        />
        {open && <ObjectForm object={object} onDone={() => onOpenChange(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
