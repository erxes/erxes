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
import { Badge, Button, cn, Collapsible, DropdownMenu, RecordTable } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PROPERTIES_BASE_PATH } from '../constants';
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
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-48" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu.Item asChild>
          <Link to={`${PROPERTIES_BASE_PATH}/${contentType}/${group.id}/add`}>
            <IconPlus />
            {t('add-field', 'Add field')}
          </Link>
        </DropdownMenu.Item>
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

/** A group's header and its fields table; `handle` and `actions` are the manager's controls. */
const GroupShell = forwardRef<
  HTMLDivElement,
  {
    name: string;
    fields: Field[];
    addPath: string;
    handle?: ReactNode;
    actions?: ReactNode;
    className?: string;
    style?: CSSProperties;
  }
>(({ name, fields, addPath, handle, actions, className, style }, ref) => {
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
      ref={ref}
      className={cn('group', className)}
      style={style}
      open={open}
      onOpenChange={(value) => {
        toggled.current = true;
        setOpen(value);
      }}
    >
      <div className="relative flex items-center gap-1">
        {handle ?? <span className="size-7 shrink-0" />}
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full justify-start font-medium">
            <Collapsible.TriggerIcon />
            {name}
            <Badge variant="secondary" className="ml-1">
              {fields.length}
            </Badge>
          </Button>
        </Collapsible.Trigger>
        {actions ?? <span className="size-7 shrink-0" />}
      </div>
      <Collapsible.Content className="pt-2">
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
            <Button variant="secondary" asChild>
              <Link to={addPath}>
                <IconPlus />
                {t('add-field', 'Add field')}
              </Link>
            </Button>
          </div>
        )}
      </Collapsible.Content>
    </Collapsible>
  );
});

GroupShell.displayName = 'GroupShell';

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
    <GroupShell
      ref={setNodeRef}
      name={group.name}
      fields={fields}
      addPath={`${PROPERTIES_BASE_PATH}/${contentType}/${group.id}/add`}
      className={cn(isDragging && 'z-10 opacity-40')}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      handle={
        manager ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 cursor-grab text-muted-foreground"
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
      addPath={`${PROPERTIES_BASE_PATH}/${contentType}/add`}
    />
  );
};
