import type { DataExtensionObject } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import {
  IconArchive,
  IconBox,
  IconColumns,
  IconDots,
  IconEdit,
  IconList,
  IconRestore,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Badge, Button, DropdownMenu, IconComponent, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useRefreshDataModel } from '../dataQueries';
import { useDataErrorToast } from '../useDataErrors';
import { ObjectDialog } from './ObjectDialog';

/** Archive, restore and delete, each refetching the data model and toasting a failure. */
const useObjectActions = () => {
  const refresh = useRefreshDataModel();
  const failed = useDataErrorToast();
  const handlers = { onSuccess: () => void refresh(), onError: (error: Error) => failed(error) };

  return {
    archive: useMutation(orpc.dataObjects.archive.mutationOptions(handlers)),
    restore: useMutation(orpc.dataObjects.restore.mutationOptions(handlers)),
    remove: useMutation(orpc.dataObjects.remove.mutationOptions(handlers)),
  };
};

const ObjectMenu = ({ object, onEdit }: { object: DataExtensionObject; onEdit: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'objects' });
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { archive, restore, remove } = useObjectActions();
  const archived = object.status === 'archived';
  const input = { key: object.key };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        aria-label={t('more', 'More')}
        render={<Button variant="ghost" size="icon" />}
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-52">
        <DropdownMenu.Item onClick={onEdit}>
          <IconEdit />
          {t('edit', 'Edit object')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => void navigate(paths.settings.dataFieldsOf(object.recordType))}
        >
          <IconColumns />
          {t('fields', 'Fields')}
        </DropdownMenu.Item>
        {!archived && (
          <DropdownMenu.Item onClick={() => void navigate(paths.objects.list(object.key))}>
            <IconList />
            {t('records', 'Records')}
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => (archived ? restore.mutate(input) : archive.mutate(input))}
        >
          {archived ? <IconRestore /> : <IconArchive />}
          {archived ? t('restore', 'Restore') : t('archive', 'Archive')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          variant="destructive"
          onClick={() =>
            void confirm({
              message: t('remove-confirm', 'Delete {{name}} and all its records?', {
                name: object.pluralLabel,
              }),
              options: {
                description: t(
                  'remove-description',
                  'Its table, records and relations are dropped. This cannot be undone.',
                ),
                confirmationValue: object.key,
                variants: { ok: 'destructive' },
              },
            }).then(() => remove.mutate(input))
          }
        >
          <IconTrash />
          {t('remove', 'Delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** An object: its icon, labels, key and status, with its actions. */
export const ObjectRow = ({ object }: { object: DataExtensionObject }) => {
  const { t } = useTranslation('data', { keyPrefix: 'objects' });
  const [editing, setEditing] = useState(false);

  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {object.icon ? (
          <IconComponent name={object.icon} className="size-4" />
        ) : (
          <IconBox className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{object.pluralLabel}</span>
          <Badge variant="secondary">{object.recordType}</Badge>
          {object.status === 'archived' && (
            <Badge variant="warning">{t('archived', 'Archived')}</Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {object.description ||
            t('no-description', 'One of them is a {{name}}.', { name: object.singularLabel })}
        </p>
      </div>
      <ObjectMenu object={object} onEdit={() => setEditing(true)} />
      <ObjectDialog object={object} open={editing} onOpenChange={setEditing} />
    </li>
  );
};
