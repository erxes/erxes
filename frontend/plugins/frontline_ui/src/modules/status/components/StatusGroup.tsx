import {
  addingStatusState,
  editingStatusState,
} from '@/settings/states/StatusStates';
import { StatusInlineIcon } from '@/status/components/StatusInline';
import { StatusSheet } from '@/status/components/StatusSheet';
import { TICKET_STATUS_TYPE_NAMES } from '@/status/constants';
import { useDeleteTicketStatus } from '@/status/hooks/useDeleteTicketStatus';
import { useGetTicketStatus } from '@/status/hooks/useGetTicketStatus';
import { useUpdateTicketStatus } from '@/status/hooks/useUpdateTicketStatus';
import { ITicketStatus } from '@/status/types';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconDots,
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  DragHandle,
  DropdownMenu,
  Skeleton,
  useToast,
} from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_ROW_CLASSNAME =
  'group relative flex min-h-11 items-center gap-2 rounded-md border bg-background px-2 py-1.5 transition-colors hover:bg-accent';

const STATUS_SKELETON_KEYS = ['status-skeleton-1', 'status-skeleton-2'];

const StatusSwatch = ({
  color,
  statusType,
}: {
  color?: string;
  statusType: number;
}) => (
  <span
    className="flex size-7 flex-none items-center justify-center rounded"
    style={{ backgroundColor: `${color || '#000000'}25` }}
  >
    <StatusInlineIcon statusType={statusType} color={color} />
  </span>
);

const StatusSkeleton = () => (
  <div className={STATUS_ROW_CLASSNAME}>
    <IconGripVertical className="size-4 flex-none opacity-0" stroke={1.5} />
    <Skeleton className="size-7 flex-none rounded" />
    <div className="flex flex-col gap-1">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  </div>
);

export const Status = ({
  status,
  isDragDisabled,
}: {
  status: ITicketStatus;
  isDragDisabled: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const setEditingStatus = useSetAtom(editingStatusState);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: status._id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const openEditSheet = () => setEditingStatus(status._id);

  return (
    <div
      className={cn(
        STATUS_ROW_CLASSNAME,
        isDragging && 'z-10 cursor-grabbing bg-accent shadow-md',
      )}
      ref={setNodeRef}
      style={style}
    >
      <DragHandle
        aria-label={t('reorder')}
        className={cn(
          'opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100',
          isDragDisabled && 'invisible',
        )}
        {...attributes}
        {...listeners}
      />
      <Button
        className="h-auto min-w-0 flex-1 justify-start whitespace-normal px-0 py-0 text-left font-normal hover:bg-transparent"
        onClick={openEditSheet}
        variant="ghost"
      >
        <StatusSwatch color={status.color} statusType={status.type} />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm capitalize leading-tight">
            {status.name}
          </span>
          {Boolean(status.description) && (
            <span
              className="truncate text-xs leading-tight text-muted-foreground"
              title={status.description}
            >
              {status.description}
            </span>
          )}
        </span>
      </Button>
      <StatusOptionMenu statusId={status._id} statusType={status.type} />
    </div>
  );
};

const StatusOptionMenu = ({
  statusId,
  statusType,
}: {
  statusId: string;
  statusType: number;
}) => {
  const { t } = useTranslation('frontline');
  const setEditingStatus = useSetAtom(editingStatusState);
  const { toast } = useToast();
  const { deleteStatus } = useDeleteTicketStatus(statusType);

  const handleDeleteStatus = () => {
    deleteStatus({
      variables: { id: statusId },
      onCompleted: () => {
        toast({
          title: t('success'),
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button className="flex-none" size="icon" variant="ghost">
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-40">
        <DropdownMenu.Item onSelect={() => setEditingStatus(statusId)}>
          <IconEdit />
          {t('edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="text-destructive"
          onSelect={handleDeleteStatus}
        >
          <IconTrash />
          {t('delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const StatusGroup = ({
  isLast,
  statusType,
}: {
  isLast?: boolean;
  statusType: number;
}) => {
  const { t } = useTranslation('frontline');
  const { statuses = [], loading } = useGetTicketStatus({
    variables: { type: statusType },
  });
  const { updateStatus } = useUpdateTicketStatus();
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [addingStatus, setAddingStatus] = useAtom(addingStatusState);
  const editingStatusId = useAtomValue(editingStatusState);
  const [_statuses, _setStatuses] = useState<ITicketStatus[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    // Every reorder write refetches the list, and adopting those refetches as
    // they land one by one is what makes the rows jump mid-drag.
    if (isReordering) return;

    if (JSON.stringify(statuses) !== JSON.stringify(_statuses)) {
      _setStatuses(statuses);
    }
  }, [_statuses, isReordering, statuses]);

  const isDragDisabled = _statuses.length <= 1 || editingStatusId !== null;
  const isAddingHere = addingStatus === statusType;
  const isEditingSomewhere = addingStatus !== null || editingStatusId !== null;
  const editingStatus = _statuses.find(
    (status) => status._id === editingStatusId,
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = _statuses.findIndex((status) => status._id === active.id);
    const newIndex = _statuses.findIndex((status) => status._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(_statuses, oldIndex, newIndex);

    setIsReordering(true);
    _setStatuses(newOrder);

    // A failure halfway leaves the earlier writes persisted, and rolling the
    // list back locally would only hide that until the next refetch.
    const writes = newOrder.flatMap((status, index) =>
      status.order === index
        ? []
        : [
            updateStatus({
              awaitRefetchQueries: true,
              variables: { id: status._id, order: index },
            }),
          ],
    );

    try {
      // Every write has to settle before the guard lifts: a rejected one would
      // otherwise leave its siblings in flight, and their refetches would land
      // unguarded and start the rows jumping again.
      const results = await Promise.allSettled(writes);

      const hasFailure = results.some((result) =>
        result.status === 'rejected' ? true : !result.value?.data,
      );

      if (hasFailure) {
        toast({
          title: t('error'),
          description: t('reorder-failed'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsReordering(false);
    }
  };

  const isEmpty = !loading && _statuses.length === 0;

  return (
    <div className="group/stage flex gap-3">
      <div className="flex w-4 flex-none flex-col items-center pt-1.5">
        <StatusInlineIcon statusType={statusType} />
        {!isLast && <span aria-hidden className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 pb-5">
        <div className="flex h-7 items-center gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase text-accent-foreground">
            {t(TICKET_STATUS_TYPE_NAMES[statusType])}
          </h3>
          {!loading && !isEmpty && (
            <span className="font-mono text-xs text-muted-foreground">
              {_statuses.length}
            </span>
          )}
          {!isEmpty && (
            <Button
              aria-label={t('add')}
              className="ml-auto"
              disabled={loading || isEditingSomewhere}
              onClick={() => setAddingStatus(statusType)}
              size="icon"
              variant="outline"
            >
              <IconPlus />
            </Button>
          )}
        </div>
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext
            items={_statuses.map((status) => status._id)}
            strategy={verticalListSortingStrategy}
          >
            {loading
              ? STATUS_SKELETON_KEYS.map((key) => <StatusSkeleton key={key} />)
              : _statuses.map((status) => (
                  <Status
                    isDragDisabled={isDragDisabled}
                    key={status._id}
                    status={status}
                  />
                ))}
          </SortableContext>
        </DndContext>

        {isEmpty && (
          <Button
            className="w-full justify-start text-muted-foreground"
            disabled={isEditingSomewhere}
            onClick={() => setAddingStatus(statusType)}
            variant="outline"
          >
            <IconPlus />
            {t('add')}
          </Button>
        )}

        <StatusSheet
          editingStatus={editingStatus}
          open={isAddingHere || Boolean(editingStatus)}
          statusType={statusType}
        />
      </div>
    </div>
  );
};
