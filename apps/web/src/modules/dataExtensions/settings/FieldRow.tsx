import type { DataExtensionField } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import {
  IconArchive,
  IconArrowsExchange,
  IconDots,
  IconEdit,
  IconRestore,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Badge, Button, DropdownMenu, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRefreshDataModel, useTypeLabel } from '../dataQueries';
import { convertTargets, FIELD_TYPES } from '../fieldTypes';
import { useDataErrorToast } from '../useDataErrors';
import { ConvertDialog } from './ConvertDialog';
import { FieldSheet } from './field/FieldSheet';
import { SortableRow } from './SortableList';

const useFieldActions = () => {
  const refresh = useRefreshDataModel();
  const failed = useDataErrorToast();
  const handlers = { onSuccess: () => void refresh(), onError: (error: Error) => failed(error) };

  return {
    archive: useMutation(orpc.dataFields.archive.mutationOptions(handlers)),
    restore: useMutation(orpc.dataFields.restore.mutationOptions(handlers)),
    remove: useMutation(orpc.dataFields.remove.mutationOptions(handlers)),
  };
};

const FieldMenu = ({
  field,
  onEdit,
  onConvert,
}: {
  field: DataExtensionField;
  onEdit: () => void;
  onConvert: () => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });
  const { confirm } = useConfirm();
  const { archive, restore, remove } = useFieldActions();
  const archived = field.status === 'archived';
  const input = { id: field.id };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        aria-label={t('more', 'More')}
        render={<Button variant="ghost" size="icon" />}
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-52">
        {!archived && (
          <DropdownMenu.Item onClick={onEdit}>
            <IconEdit />
            {t('edit', 'Edit')}
          </DropdownMenu.Item>
        )}
        {!archived && convertTargets(field.type).length > 0 && (
          <DropdownMenu.Item onClick={onConvert}>
            <IconArrowsExchange />
            {t('convert', 'Convert type')}
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Item
          onClick={() => (archived ? restore.mutate(input) : archive.mutate(input))}
        >
          {archived ? <IconRestore /> : <IconArchive />}
          {archived ? t('restore', 'Restore') : t('archive', 'Archive')}
        </DropdownMenu.Item>
        {archived && (
          <DropdownMenu.Item
            variant="destructive"
            onClick={() =>
              void confirm({
                message: t('remove-confirm', 'Delete {{label}} and its values?', {
                  label: field.label,
                }),
                options: { variants: { ok: 'destructive' } },
              }).then(() => remove.mutate(input))
            }
          >
            <IconTrash />
            {t('remove', 'Delete')}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** Badges for what the field does besides holding a value. */
const FieldFlags = ({ field }: { field: DataExtensionField }) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });
  const { required, unique, readOnly, visibleWhen, visibleTo } = field.settings;

  return (
    <span className="flex shrink-0 gap-1">
      {required && <Badge variant="secondary">{t('required', 'Required')}</Badge>}
      {unique && <Badge variant="secondary">{t('unique', 'Unique')}</Badge>}
      {readOnly && <Badge variant="secondary">{t('read-only', 'Read-only')}</Badge>}
      {visibleWhen && <Badge variant="info">{t('conditional', 'Conditional')}</Badge>}
      {visibleTo?.length ? <Badge variant="warning">{t('restricted', 'Some roles')}</Badge> : null}
    </span>
  );
};

/** A field of the list: drag it by its grip, open it to edit, or use its menu. */
export const FieldRow = ({ field, sortable }: { field: DataExtensionField; sortable: boolean }) => {
  const typeLabel = useTypeLabel();
  const [editing, setEditing] = useState(false);
  const [converting, setConverting] = useState(false);
  const TypeIcon = FIELD_TYPES[field.type].icon;

  return (
    <SortableRow id={field.id} label={field.label} sortable={sortable}>
      <TypeIcon className="size-4 shrink-0 text-muted-foreground" />
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left text-sm"
        disabled={!sortable}
        onClick={() => setEditing(true)}
      >
        {field.label} <span className="text-xs text-muted-foreground">{field.key}</span>
      </button>
      <FieldFlags field={field} />
      <Badge variant="muted">{typeLabel(field.type)}</Badge>
      <FieldMenu
        field={field}
        onEdit={() => setEditing(true)}
        onConvert={() => setConverting(true)}
      />
      <FieldSheet
        recordType={field.recordType}
        field={field}
        open={editing}
        onOpenChange={setEditing}
      />
      <ConvertDialog field={field} open={converting} onOpenChange={setConverting} />
    </SortableRow>
  );
};
