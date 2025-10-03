import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import {
  addingStatusState,
  editingStatusState,
} from '@/team/states/StatusStates';
import { useAddStatus } from '@/team/hooks/useAddStatus';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { useStatusesByType } from '@/team/hooks/useGetStatus';
import { useUpdateStatus } from '@/team/hooks/useUpdateStatus';
import { useSortable } from '@dnd-kit/sortable';
import { ITeamStatus } from '@/team/types';
import { TEAM_STATUS_FORM_SCHEMA } from '@/team/schemas';
import {
  Button,
  cn,
  DropdownMenu,
  Form,
  Input,
  useToast,
  Skeleton,
  ColorPicker,
} from 'erxes-ui';
import {
  IconDots,
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useParams } from 'react-router';
import { useDeleteStatus } from '@/team/hooks/useDeleteStatus';
import {
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/operation/components/StatusInline';

const StatusSkeleton = () => {
  return (
    <div className="flex items-center justify-between py-2 pl-1 pr-2 rounded my-1 shadow-xs cursor-default group relative">
      <div className="absolute inset-0 rounded" />
      <span className="flex items-center gap-1">
        <IconGripVertical className="invisible w-4 h-4" stroke={1.5} />
        <Skeleton className="size-7" />
        <div className="flex flex-col">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-2 w-16 mt-1" />
        </div>
      </span>
      <Button variant="ghost" size="icon" disabled={true}>
        <IconDots />
      </Button>
    </div>
  );
};

export const Status = ({
  status,
  isDragDisabled,
}: {
  status: ITeamStatus;
  isDragDisabled: boolean;
}) => {
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
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const dragProps = isDragDisabled ? {} : { ...attributes, ...listeners };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between py-2 pl-1 pr-2 rounded my-1 shadow-xs cursor-default group relative',
        isDragging && 'cursor-grabbing shadow-lg',
      )}
    >
      <div className="absolute inset-0 rounded" {...dragProps} />
      <span className="flex items-center gap-2">
        <IconGripVertical
          className={cn(
            'w-4 h-4 transition-all',
            isDragDisabled
              ? 'opacity-0'
              : 'group-hover:opacity-100 opacity-0 hover:cursor-move',
          )}
          stroke={1.5}
        />
        <Button
          size={'icon'}
          variant={'secondary'}
          className="cursor-default hover:bg-muted relative"
          style={{
            backgroundColor: status.color ? `${status.color}25` : '#00000025',
            color: status.color || '#000000',
          }}
        >
          <StatusInlineIcon statusType={status.type} color={status.color} />
        </Button>
        <div className="flex flex-col">
          <span className="capitalize">{status.name}</span>
          <span className="text-xs text-muted-foreground">
            {status.description}
          </span>
        </div>
      </span>
      <StatusOptionMenu statusId={status._id} />
    </div>
  );
};

const StatusOptionMenu = ({ statusId }: { statusId: string }) => {
  const setEditingStatus = useSetAtom(editingStatusState);
  const { toast } = useToast();
  const { deleteStatus } = useDeleteStatus();

  const handleDeleteStatus = () => {
    deleteStatus({
      variables: { id: statusId },
      onCompleted: () => {
        toast({
          title: 'Success!',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        side="bottom"
        alignOffset={-160}
        className="min-w-48 text-sm"
        align="start"
      >
        <DropdownMenu.Item
          onClick={(e) => {
            e.stopPropagation();
            setEditingStatus(statusId);
          }}
        >
          <IconEdit />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="text-destructive"
          onClick={handleDeleteStatus}
        >
          <IconTrash />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const StatusForm = ({
  statusType,
  editingStatus,
}: {
  statusType: number;
  editingStatus?: ITeamStatus;
}) => {
  const { addStatus } = useAddStatus();
  const { toast } = useToast();
  const { updateStatus } = useUpdateStatus();
  const { id: teamId } = useParams();
  const setAddingStatus = useSetAtom(addingStatusState);
  const setEditingStatus = useSetAtom(editingStatusState);

  const isEditing = !!editingStatus;

  const form = useForm<z.infer<typeof TEAM_STATUS_FORM_SCHEMA>>({
    resolver: zodResolver(TEAM_STATUS_FORM_SCHEMA),
    defaultValues: {
      name: editingStatus?.name || '',
      description: editingStatus?.description || '',
      color: editingStatus?.color || '#000000',
    },
  });

  useEffect(() => {
    form.setFocus('name');
  }, [form]);

  const onSubmit = (data: z.infer<typeof TEAM_STATUS_FORM_SCHEMA>) => {
    const { name, description, color } = data;

    if (isEditing && editingStatus) {
      updateStatus({
        variables: {
          _id: editingStatus._id,
          name,
          description,
          color: color?.length && color.length > 2 ? color : '',
        },
        onCompleted: () => {
          setEditingStatus(null);
        },
      });
    } else {
      addStatus({
        variables: { name, description, color, teamId, type: statusType },
        onCompleted: () => {
          setAddingStatus(null);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setEditingStatus(null);
    } else {
      setAddingStatus(null);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 pl-1 pr-2 rounded my-1 shadow-xs cursor-default group overflow-x-auto',
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <span className="flex items-center gap-1">
            <IconGripVertical className="invisible w-4 h-4" stroke={1.5} />
            <Form.Field
              control={form.control}
              name="color"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <ColorPicker.Provider
                      value={field.value || '#000000'}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <ColorPicker.Trigger asChild>
                        <Button
                          size={'icon'}
                          variant={'secondary'}
                          className="cursor-default hover:bg-muted m-0 size-7 p-0 flex items-center justify-center bg-accent shadow-none hover:cursor-pointer"
                          style={{
                            backgroundColor: field.value
                              ? `${field.value}25`
                              : undefined,
                          }}
                        >
                          <StatusInlineIcon statusType={statusType} />
                        </Button>
                      </ColorPicker.Trigger>
                      <ColorPicker.Content />
                    </ColorPicker.Provider>
                  </Form.Control>
                </Form.Item>
              )}
            ></Form.Field>

            <span className="flex items-center w-auto gap-1 ">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Input placeholder="Name" {...field} className="w-full" />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Control>
                      <Input
                        placeholder="Description"
                        {...field}
                        className="w-full"
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </span>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Update' : 'Save'}</Button>
          </span>
        </form>
      </Form>
    </div>
  );
};

export const StatusGroup = ({ statusType }: { statusType: number }) => {
  const { statuses = [], loading } = useStatusesByType({ type: statusType });
  const { updateStatus } = useUpdateStatus();
  const { toast } = useToast();
  const [addingStatus, setAddingStatus] = useAtom(addingStatusState);
  const editingStatusId = useAtomValue(editingStatusState);
  const [_statuses, _setStatuses] = useState(statuses);

  useEffect(() => {
    _setStatuses(statuses);
  }, [statuses]);

  const isDragDisabled = _statuses.length <= 1 || editingStatusId !== null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = statuses.findIndex((status) => status._id === active.id);
    const newIndex = statuses.findIndex((status) => status._id === over.id);

    const newOrder = arrayMove(statuses, oldIndex, newIndex);

    newOrder.forEach((status, index) => {
      updateStatus({
        variables: {
          _id: status._id,
          order: index,
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    });

    _setStatuses(newOrder);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { delta } = event;
    if (delta) {
      delta.x = 0;
    }
  };
  return (
    <section className="w-full p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 justify-between w-full bg-accent py-1 pr-2 pl-4 rounded-md">
          <div className="flex items-center gap-2 ">
            <p className="text-base font-medium">
              <StatusInlineLabel statusType={statusType} />
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAddingStatus(statusType)}
            disabled={addingStatus !== null || editingStatusId !== null}
            className="size-6"
          >
            <IconPlus className="stroke-foreground" />
          </Button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
      >
        <SortableContext
          items={_statuses.map((status) => status._id)}
          strategy={verticalListSortingStrategy}
        >
          {loading
            ? Array.from({ length: 2 }).map((_, index) => (
                <StatusSkeleton key={index} />
              ))
            : _statuses.map((status) => {
                if (editingStatusId === status._id) {
                  return (
                    <StatusForm
                      key={status._id}
                      statusType={statusType}
                      editingStatus={status}
                    />
                  );
                }
                return (
                  <Status
                    key={status._id}
                    status={status}
                    isDragDisabled={isDragDisabled}
                  />
                );
              })}
          {addingStatus === statusType && (
            <StatusForm statusType={statusType} />
          )}
        </SortableContext>
      </DndContext>
    </section>
  );
};
