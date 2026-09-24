import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';
import {
  AutomationsHotKeyScope,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import { useNavigate } from 'react-router-dom';
import { ApolloError, useMutation } from '@apollo/client';
import {
  IconCopy,
  IconEdit,
  IconPointerBolt,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  DropdownMenu,
  Button,
  useToast,
} from 'erxes-ui';
import {
  ApprovalLockedBadge,
  TagsSelect,
  TAutomationAction,
  TAutomationTrigger,
} from 'ui-modules';
import { AutomationExecutionCountCell } from '@/automations/components/list/AutomationExecutionCountCell';
import { AutomationRecordTableUserInlineCell } from '@/automations/components/list/AutomationRecordTableUserInlineCell';
import { AutomationRecordTableStatusInlineCell } from '@/automations/components/list/AutomationRecordTableStatusInlineCell';
import { useState } from 'react';
import { useAutomationActions } from '@/automations/hooks/useAutomationActions';
import { useTranslation } from 'react-i18next';

const checkBoxColumn =
  RecordTable.checkboxColumn as ColumnDef<TAutomationRecordTableColumnDefData>;

export const getAutomationColumns: (
  t: (key: string) => string,
) => ColumnDef<TAutomationRecordTableColumnDefData>[] = (t) => [
  {
    id: 'more',
    cell: ({ cell }) => {
      const { t } = useTranslation('automations');
      const { canWrite, duplicating, removing, onEdit, onDuplicate, onRemove } =
        useAutomationActions(cell.row.original);

      return (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild disabled={removing || duplicating}>
            <RecordTable.MoreButton className="w-full h-full" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="start"
            className="w-[140px] min-w-0 [&>button]:cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu.Item asChild onSelect={onEdit}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <IconEdit className="size-4" />
                {t('edit')}
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                disabled={duplicating}
                onClick={onDuplicate}
              >
                <IconCopy className="size-4" />
                {t('duplicate')}
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive"
                disabled={!canWrite || removing}
                onClick={onRemove}
              >
                <IconTrash className="size-4" />
                {t('delete')}
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );
    },
    size: 33,
    maxSize: 33,
    minSize: 33,
  },
  checkBoxColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => {
      const currentName = cell.getValue() as string;
      const automationId = cell.row.original._id;
      const [editingName, setEditingName] = useState(currentName);
      const navigate = useNavigate();
      const [edit] = useMutation(AUTOMATION_EDIT);
      const { toast } = useToast();
      const lockState = cell.row.original.approvalLockState;
      const canWrite = !lockState?.locked || lockState.hasAccess;
      const handleEnter = () => {
        if (!canWrite) {
          return;
        }

        if (editingName === currentName || editingName.trim() === '') {
          return;
        }
        edit({
          variables: {
            id: automationId,
            name: editingName,
          },
          onError: (e: ApolloError) => {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          },
          onCompleted: () => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Automation updated successfully',
            });
          },
        });
      };

      if (!canWrite) {
        return (
          <RecordTableInlineCell.Anchor
            onClick={() => {
              navigate(`/automations/edit/${automationId}`);
            }}
          >
            <span className="truncate">{currentName}</span>
          </RecordTableInlineCell.Anchor>
        );
      }

      return (
        <PopoverScoped
          closeOnEnter
          onEnter={handleEnter}
          dependencies={[automationId, canWrite, currentName, editingName]}
        >
          <RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Anchor
              onClick={() => {
                navigate(`/automations/edit/${automationId}`);
              }}
            >
              <span className="truncate">{currentName}</span>
            </RecordTableInlineCell.Anchor>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
            />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      );
    },
    minSize: 150,
  },
  {
    id: 'visibility',
    header: () => <RecordTable.InlineHead label={t('visibility')} />,
    cell: ({ cell }) => {
      const lockState = cell.row.original.approvalLockState;
      const isPrivate = lockState?.locked === true;

      return (
        <RecordTableInlineCell>
          {isPrivate ? (
            <ApprovalLockedBadge state={lockState} />
          ) : (
            <Badge variant="secondary">{t('public')}</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label={t('status')} />,
    cell: ({ cell }) => {
      return <AutomationRecordTableStatusInlineCell cell={cell} />;
    },
    size: 80,
  },

  {
    id: 'triggers',
    accessorKey: 'triggers',
    header: () => <RecordTable.InlineHead label={t('triggers')} />,
    cell: ({ cell }) => {
      const triggers = (cell.getValue() || []) as TAutomationTrigger[];
      return (
        <RecordTableInlineCell>
          <IconPointerBolt size={12} />
          {triggers?.length}
        </RecordTableInlineCell>
      );
    },
    size: 80,
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: () => <RecordTable.InlineHead label={t('actions')} />,
    cell: ({ cell }) => {
      const actions = (cell.getValue() || []) as TAutomationAction[];
      return (
        <RecordTableInlineCell>
          <IconShare size={12} />
          {actions?.length}
        </RecordTableInlineCell>
      );
    },
    size: 80,
  },
  {
    id: 'executionCount',
    header: () => <RecordTable.InlineHead label={t('runs')} />,
    cell: ({ cell }) => (
      <AutomationExecutionCountCell id={cell.row.original._id} />
    ),
    size: 100,
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead label={t('tags')} />,
    cell: ({ cell }) => {
      const tagIds = cell.getValue() as string[];

      return (
        <TagsSelect.InlineCell
          scope={AutomationsHotKeyScope.AutomationsTableInlinePopover}
          type="core:automation"
          mode="multiple"
          value={tagIds}
          targetIds={[cell.row.original._id]}
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              cache.modify({
                id: cache.identify({
                  __typename: 'Automation',
                  _id: cell.row.original._id,
                }),
                fields: {
                  tagIds: () => newSelectedTagIds,
                },
              });
            },
          })}
        />
      );
    },
  },
  {
    id: 'updatedUser',
    accessorKey: 'updatedUser',
    header: () => <RecordTable.InlineHead label={t('updated-user')} />,
    cell: ({ cell }) => <AutomationRecordTableUserInlineCell cell={cell} />,
  },
  {
    id: 'createdUser',
    accessorKey: 'createdUser',
    header: () => <RecordTable.InlineHead label={t('created-user')} />,
    cell: ({ cell }) => <AutomationRecordTableUserInlineCell cell={cell} />,
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => <RecordTable.InlineHead label={t('last-updated-at')} />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label={t('created-at')} />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
