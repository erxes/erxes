import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconGripVertical,
  IconListDetails,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  AlertDialog,
  Button,
  buttonVariants,
  cn,
  Collapsible,
  InfoCard,
  Spinner,
  Tooltip,
} from 'erxes-ui';
import { forwardRef, useState } from 'react';
import { useFieldGroups } from 'ui-modules/modules/properties/hooks/useFieldGroups';
import { useFields } from 'ui-modules/modules/properties/hooks/useFields';
import {
  IField,
  IFieldGroup,
  IPropertyRow,
  IFieldMutation,
} from 'ui-modules/modules/properties/types/fieldsTypes';
import {
  formatFieldValue,
  getPropertyRowsUpdate,
  hasFieldValue,
  isFieldVisibleByLogic,
  toPropertyGroupKey,
} from 'ui-modules/modules/properties/propertyUtils';
import { nanoid } from 'nanoid';
import {
  Field,
  FieldMultiple,
} from 'ui-modules/modules/properties/components/Field';
import { GroupFieldRows } from 'ui-modules/modules/properties/components/GroupFieldRows';
import { useNavigate } from 'react-router-dom';

export const PropertyGroupShell = ({
  group,
  action,
  children,
}: {
  group: IFieldGroup;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Collapsible
    defaultOpen
    className="group flex flex-col rounded-xl bg-foreground/5 p-1 pt-0"
  >
    <div className="flex h-7 shrink-0 items-center justify-between pr-1">
      <Collapsible.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1.5 px-1 font-mono text-xs font-medium uppercase"
        >
          <Collapsible.TriggerIcon className="size-3" />
          {group.name}
        </Button>
      </Collapsible.Trigger>

      {action}
    </div>

    <Collapsible.Content>{children}</Collapsible.Content>
  </Collapsible>
);

export const PropertyGroupCard = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="rounded-lg bg-background p-3 shadow-sm">{children}</div>;

const FieldGroupContent = ({
  group,
  contentType,
  propertiesData,
  mutateHook,
  id,
}: {
  group: IFieldGroup;
  id: string;
  inCell?: boolean;
  contentType: string;
  propertiesData: Record<string, unknown>;
  mutateHook: () => IFieldMutation;
}) => {
  const { configs } = group || {};
  const { fields, loading } = useFields({ groupId: group._id, contentType });

  const visibleFields = fields
    .filter((field) => field.isVisible !== false)
    .filter((field) => isFieldVisibleByLogic(field, propertiesData));

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  if (visibleFields.length === 0) {
    return null;
  }

  if (configs?.isMultiple) {
    return (
      <MultipleFieldsInGroup
        group={group}
        id={id}
        contentType={contentType}
        propertiesData={propertiesData}
        mutateHook={mutateHook}
        fields={visibleFields}
      />
    );
  }

  return (
    <PropertyGroupShell group={group}>
      <PropertyGroupCard>
        <FieldsInGroup
          group={group}
          id={id}
          contentType={contentType}
          propertiesData={propertiesData}
          mutateHook={mutateHook}
          fields={visibleFields}
        />
      </PropertyGroupCard>
    </PropertyGroupShell>
  );
};

const getPropertiesSettingsPath = (contentType: string) => {
  const [pluginName] = contentType.split(':');

  return pluginName === 'core'
    ? `/settings/properties/${contentType}`
    : `/${pluginName}/settings/properties/${contentType}`;
};

/** Links an empty property list to its content-type settings page. */
const EmptyProperties = ({
  fieldContentType,
}: {
  fieldContentType: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-center items-center flex-1 w-full gap-2">
      <IconListDetails
        className="text-muted-foreground"
        size={64}
        stroke={1.5}
      />
      <h3 className="font-semibold text-muted-foreground">
        No properties found{' '}
      </h3>
      <div className="flex flex-col justify-center items-center gap-2 my-2">
        <p className="text-muted-foreground">
          Get started by creating your first property.
        </p>
        <Button
          size="sm"
          onClick={() => {
            navigate(getPropertiesSettingsPath(fieldContentType));
          }}
        >
          Create property
        </Button>
      </div>
    </div>
  );
};

export const FieldsInDetail = ({
  fieldContentType,
  propertiesData,
  mutateHook,
  id,
  className,
  bare = false,
}: {
  fieldContentType: string;
  propertiesData: Record<string, unknown>;
  mutateHook: () => IFieldMutation;
  id: string;
  className?: string;
  // Only the property groups, without the outer "… Properties" card; for
  // hosts that already say what they show (a side panel tab).
  bare?: boolean;
}) => {
  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: fieldContentType,
  });

  if (fieldGroupsLoading) {
    return <Spinner containerClassName="py-6" />;
  }
  const [, propertyName] = fieldContentType.split(':');

  const groups =
    fieldGroups.length === 0 ? (
      <EmptyProperties fieldContentType={fieldContentType} />
    ) : (
      fieldGroups.map((group) => (
        <FieldGroupContent
          key={group._id}
          group={group}
          id={id}
          contentType={fieldContentType}
          propertiesData={propertiesData}
          mutateHook={mutateHook}
        />
      ))
    );

  if (bare) {
    return <div className={cn('flex flex-col gap-2', className)}>{groups}</div>;
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <InfoCard title={`${propertyName} Properties`}>
        <InfoCard.Content>{groups}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

/** Renders each visible property through the shared field-row layout. */
export const FieldsInGroup = ({
  group,
  propertiesData,
  mutateHook,
  id,
  fields,
}: {
  group: IFieldGroup;
  id: string;
  inCell?: boolean;
  contentType: string;
  propertiesData: Record<string, unknown>;
  mutateHook: () => IFieldMutation;
  fields: IField[];
}) => {
  return (
    <GroupFieldRows
      group={group}
      fields={fields}
      renderField={(field) => (
        <Field
          key={field._id}
          field={field}
          value={propertiesData[field._id] as string}
          propertiesData={propertiesData}
          id={id}
          mutateHook={mutateHook}
        />
      )}
    />
  );
};

// a collapsed row is told apart by its first filled value
const rowLabel = (row: IPropertyRow, fields: IField[]) => {
  for (const field of fields) {
    const value = row[field._id];

    if (hasFieldValue(value)) {
      return formatFieldValue(field, value);
    }
  }

  return '';
};

/** Shows the removal tooltip while forwarding the dialog trigger props. */
const PropertyEntryRemoveTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => (
  <Tooltip delayDuration={1}>
    <Tooltip.Trigger asChild>
      <Button
        {...props}
        ref={ref}
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <IconTrash />
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content side="left">
      <p>Remove entry</p>
    </Tooltip.Content>
  </Tooltip>
));
PropertyEntryRemoveTrigger.displayName = 'PropertyEntryRemoveTrigger';

/** Confirms deletion of one repeated property entry before invoking its mutation. */
const RemovePropertyEntry = ({
  label,
  groupName,
  onRemove,
}: {
  label: string;
  groupName: string;
  onRemove: () => void;
}) => (
  <AlertDialog>
    <AlertDialog.Trigger asChild>
      <PropertyEntryRemoveTrigger />
    </AlertDialog.Trigger>

    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Remove entry</AlertDialog.Title>
        <AlertDialog.Description>
          {`"${label}" will be removed from ${groupName}. This cannot be undone.`}
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action
          className={buttonVariants({ variant: 'destructive' })}
          onClick={onRemove}
        >
          Remove
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog>
);

/** Groups the entry expansion control, reorder handle, and removal action. */
const PropertyEntryHeader = ({
  label,
  groupName,
  dragHandle,
  onRemove,
}: {
  label: string;
  groupName: string;
  dragHandle?: React.ReactNode;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-1 px-1">
    {dragHandle}

    <Collapsible.Trigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 justify-start gap-2 font-normal"
      >
        <Collapsible.TriggerIcon />
        <span className="truncate text-accent-foreground">{label}</span>
      </Button>
    </Collapsible.Trigger>

    <RemovePropertyEntry
      label={label}
      groupName={groupName}
      onRemove={onRemove}
    />
  </div>
);

const PropertyGroupRow = forwardRef<
  HTMLDivElement,
  {
    group: IFieldGroup;
    fields: IField[];
    row: IPropertyRow;
    index: number;
    propertiesData: Record<string, unknown>;
    mutateHook: () => IFieldMutation;
    id: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRemove: () => void;
    dragHandle?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }
>(
  (
    {
      group,
      fields,
      row,
      index,
      propertiesData,
      mutateHook,
      id,
      open,
      onOpenChange,
      onRemove,
      dragHandle,
      className,
      style,
    },
    ref,
  ) => {
    const label = rowLabel(row, fields) || `Entry ${index + 1}`;

    return (
      <Collapsible
        ref={ref}
        style={style}
        open={open}
        onOpenChange={onOpenChange}
        className={cn('group rounded-lg bg-background shadow-sm', className)}
      >
        <PropertyEntryHeader
          label={label}
          groupName={group.name}
          dragHandle={dragHandle}
          onRemove={onRemove}
        />

        <Collapsible.Content className="p-3 pt-1">
          <GroupFieldRows
            group={group}
            fields={fields}
            renderField={(field) => (
              <FieldMultiple
                key={field._id}
                group={group}
                field={field}
                rowId={row._id}
                value={row[field._id] as string}
                propertiesData={propertiesData}
                id={id}
                mutateHook={mutateHook}
              />
            )}
          />
        </Collapsible.Content>
      </Collapsible>
    );
  },
);
PropertyGroupRow.displayName = 'PropertyGroupRow';

/** Connects a property entry to its drag handle and sortable position. */
const SortablePropertyGroupRow = (
  props: React.ComponentProps<typeof PropertyGroupRow>,
) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.row._id });

  return (
    <PropertyGroupRow
      {...props}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'z-10 opacity-40')}
      dragHandle={
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 cursor-grab text-muted-foreground"
          aria-label="Reorder entry"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical />
        </Button>
      }
    />
  );
};

/** Adds, removes, and reorders entries using the owning mutation data mode. */
export const MultipleFieldsInGroup = ({
  group,
  propertiesData,
  mutateHook,
  id,
  fields,
}: {
  group: IFieldGroup;
  id: string;
  inCell?: boolean;
  contentType: string;
  propertiesData: Record<string, unknown>;
  mutateHook: () => IFieldMutation;
  fields: IField[];
}) => {
  const { mutate, loading, propertiesDataMode } = mutateHook();

  const groupKey = toPropertyGroupKey(group._id);
  const rows = (propertiesData[groupKey] || []) as IPropertyRow[];

  // an explicit toggle wins over the default below
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>(
    {},
  );

  /** Applies an explicit expansion preference or opens the sole or empty entry. */
  const isRowOpen = (row: IPropertyRow) =>
    openOverrides[row._id] ??
    (rows.length === 1 ||
      !fields.some((field) => hasFieldValue(row[field._id])));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** Saves only this group in patch mode and preserves all properties in replace mode. */
  const saveRows = (nextRows: IPropertyRow[]) =>
    mutate({
      _id: id,
      propertiesData: getPropertyRowsUpdate(
        propertiesData,
        groupKey,
        nextRows,
        propertiesDataMode,
      ),
    });

  // persisted on add, so every row is drag-ordered and id-addressable at once
  const handleAddRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const rowId = nanoid();

    setOpenOverrides((overrides) => ({ ...overrides, [rowId]: true }));
    saveRows([...rows, { _id: rowId }]);
  };

  /** Removes the selected property entry and persists the remaining order. */
  const handleRemoveRow = (rowId: string) =>
    saveRows(rows.filter((row) => row._id !== rowId));

  /** Persists a reorder only when both dragged entry positions are valid. */
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const from = rows.findIndex((row) => row._id === active.id);
    const to = rows.findIndex((row) => row._id === over.id);

    if (from === -1 || to === -1) {
      return;
    }

    saveRows(arrayMove(rows, from, to));
  };

  return (
    <PropertyGroupShell
      group={group}
      action={
        <Tooltip delayDuration={1}>
          <Tooltip.Trigger asChild>
            <Button
              onClick={handleAddRow}
              disabled={loading}
              variant="ghost"
              size="icon"
              className="size-6"
            >
              <IconPlus />
            </Button>
          </Tooltip.Trigger>

          <Tooltip.Content side="left">
            <p>Add entry</p>
          </Tooltip.Content>
        </Tooltip>
      }
    >
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={rows.map((row) => row._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {rows.map((row, index) => (
              <SortablePropertyGroupRow
                key={row._id}
                group={group}
                fields={fields}
                row={row}
                index={index}
                propertiesData={propertiesData}
                mutateHook={mutateHook}
                id={id}
                open={isRowOpen(row)}
                onOpenChange={(open) =>
                  setOpenOverrides((overrides) => ({
                    ...overrides,
                    [row._id]: open,
                  }))
                }
                onRemove={() => handleRemoveRow(row._id)}
              />
            ))}

            {!rows.length && (
              <p className="rounded-lg bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm">
                No entries yet.
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </PropertyGroupShell>
  );
};
