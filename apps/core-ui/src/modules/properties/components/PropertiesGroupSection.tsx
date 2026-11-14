import type { FieldContentType, Field, FieldGroup } from '@erxes/core-contract';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconDots,
  IconEdit,
  IconGripVertical,
  IconLayoutRows,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  Collapsible,
  DropdownMenu,
  RecordTable,
  buttonVariants,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { propertiesPath } from '../constants';
import { activeLayoutGroupState, activePropertyGroupState, archiveTargetState } from '../states';
import { useCanManageFields } from '../usePropertyMutations';
import { propertiesColumns } from './propertiesColumns';
import { PropertiesRow } from './PropertiesRow';

const PropertiesGroupActions = ({
  group,
  contentType,
}: {
  group: FieldGroup;
  contentType: FieldContentType;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const setActivePropertyGroup = useSetAtom(activePropertyGroupState);
  const setLayoutGroup = useSetAtom(activeLayoutGroupState);
  const setArchiveTarget = useSetAtom(archiveTargetState);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-48" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu.LinkItem
          render={<Link to={`${propertiesPath(contentType)}/${group.id}/add`} />}
        >
          <IconPlus />
          {t('add-field', 'Add field')}
        </DropdownMenu.LinkItem>
        <DropdownMenu.Item onClick={() => setActivePropertyGroup(group)}>
          <IconEdit />
          {t('edit', 'Edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => setLayoutGroup(group)}>
          <IconLayoutRows />
          {t('layout', 'Layout')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() =>
            setArchiveTarget({ kind: 'group', id: group.id, label: `"${group.name}"` })
          }
        >
          <IconTrash />
          {t('remove', 'Remove')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

type GroupShellProps = {
  name: string;
  fields: Field[];
  addPath: string;
  handle?: ReactNode;
  actions?: ReactNode;
};

/** A group's header and its fields table; `handle` and `actions` are the manager's controls. */
const GroupShell = ({
  name,
  fields,
  addPath,
  handle,
  actions,
}: GroupShellProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();
  const [open, setOpen] = useState(fields.length > 0);
  const toggled = useRef(false);

  // Open while it has fields, until the user opens or closes it.
  useEffect(() => {
    if (!toggled.current) setOpen(fields.length > 0);
  }, [fields.length]);

  const columns = useMemo(
    () => propertiesColumns(t, { fieldIds: fields.map((field) => field.id) }),
    [t, fields],
  );

  return (
    <Collapsible
      className="group"
      open={open}
      onOpenChange={(value) => {
        toggled.current = true;
        setOpen(value);
      }}
    >
      <div className="relative flex items-center gap-1">
        {handle ?? <span className="size-7 shrink-0" />}
        <Collapsible.Trigger
          render={<Button variant="secondary" className="w-full justify-start" />}
        >
          <Collapsible.TriggerIcon />
          {name}
          <Badge variant="secondary" className="ml-1">
            {fields.length}
          </Badge>
        </Collapsible.Trigger>
        {actions ?? <span className="size-7 shrink-0" />}
      </div>
      <Collapsible.Panel className="mt-2">
        {fields.length === 0 ? (
          <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">
            {t('no-fields-found', 'No fields found')}
          </div>
        ) : (
          <RecordTable.Provider
            columns={columns}
            data={fields}
            stickyColumns={['more', 'checkbox', 'name']}
            className="rounded-md border"
          >
            <RecordTable.Scroll className="h-auto" viewportClassName="max-h-96">
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList Row={PropertiesRow} />
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </RecordTable.Provider>
        )}
        {manager && (
          <div className="flex items-center justify-end mt-2">
            <Link to={addPath} className={buttonVariants({ variant: 'secondary' })}>
              <IconPlus />
              {t('add-field', 'Add field')}
            </Link>
          </div>
        )}
      </Collapsible.Panel>
    </Collapsible>
  );
};

/** A field group: drag handle, collapsible header with its count, actions and its fields. */
export const PropertiesGroupSection = ({
  group,
  fields,
  contentType,
}: {
  group: FieldGroup;
  fields: Field[];
  contentType: FieldContentType;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();

  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: group.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn('sortable', isDragging && 'z-10 opacity-40')}
      style={{
        '--sortable-transform': CSS.Transform.toString(transform),
        '--sortable-transition': transition,
      }}
    >
      <GroupShell
        name={group.name}
        fields={fields}
        addPath={`${propertiesPath(contentType)}/${group.id}/add`}
        handle={
          manager ? (
            <Button
              variant="ghost"
              size="icon"
              tone="muted"
              className="shrink-0 cursor-grab"
              aria-label={t('reorder-group', 'Reorder group')}
              {...attributes}
              {...listeners}
            >
              <IconGripVertical />
            </Button>
          ) : undefined
        }
        actions={
          manager ? <PropertiesGroupActions group={group} contentType={contentType} /> : undefined
        }
      />
    </div>
  );
};

/** Fields made before groups existed (no group): listed together until moved into one. */
export const PropertiesUngroupedSection = ({
  fields,
  contentType,
}: {
  fields: Field[];
  contentType: FieldContentType;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <GroupShell
      name={t('ungrouped', 'Ungrouped')}
      fields={fields}
      addPath={`${propertiesPath(contentType)}/add`}
    />
  );
};