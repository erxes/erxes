import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';
import {
  AutomationsHotKeyScope,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import { useNavigate } from 'react-router-dom';
import { ApolloError, useMutation } from '@apollo/client';
import {
  IconEdit,
  IconPointerBolt,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  cn,
  Input,
  Label,
  Popover,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Switch,
  DropdownMenu,
  Button,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { TagsSelect, TAutomationAction, TAutomationTrigger } from 'ui-modules';
import { AutomationRecordTableUserInlineCell } from '@/automations/components/list/AutomationRecordTableUserInlineCell';
import { AutomationRecordTableStatusInlineCell } from '@/automations/components/list/AutomationRecordTableStatusInlineCell';
import { useState } from 'react';
import { useRemoveAutomations } from '@/automations/hooks/useRemoveAutomations';

const checkBoxColumn =
  RecordTable.checkboxColumn as ColumnDef<TAutomationRecordTableColumnDefData>;

export const getAutomationColumns: (
  t: (key: string) => string,
) => ColumnDef<TAutomationRecordTableColumnDefData>[] = (t) => [
  {
    id: 'more',
    cell: ({ cell }) => {
      const navigate = useNavigate();
      const { confirm } = useConfirm();
      const { removeAutomations, loading } = useRemoveAutomations();
      const { toast } = useToast();

      const onRemove = () => {
        confirm({
          message: `Are you sure you want to delete the "${cell.row.original.name}" automation?`,
        }).then(() => {
          removeAutomations([cell.row.original._id], {
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
                description: 'Automations deleted successfully',
              });
            },
          });
        });
      };
      return (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild disabled={loading}>
            <RecordTable.MoreButton className="w-full h-full" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="start"
            className="w-[100px] min-w-0 [&>button]:cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  navigate(`/automations/edit/${cell.row.original._id}`)
                }
              >
                <IconEdit className="size-4" />
                Edit
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive"
                onClick={() => onRemove()}
              >
                <IconTrash className="size-4" />
                Delete
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );
    },
    size: 34,
    maxSize: 34,
    minSize: 34,
  },
  checkBoxColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => {
      const [editingName, setEditingName] = useState(cell.getValue() as string);
      const navigate = useNavigate();
      const [edit] = useMutation(AUTOMATION_EDIT);
      const { toast } = useToast();
      const handleEnter = () => {
        if (
          editingName === (cell.getValue() as string) ||
          editingName.trim() === ''
        ) {
          return;
        }
        edit({
          variables: {
            id: cell.row.original._id,
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
      return (
        <PopoverScoped closeOnEnter onEnter={handleEnter}>
          <RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Anchor
              onClick={() => {
                navigate(`/automations/edit/${cell.row.original._id}`);
              }}
            >
              {cell.getValue() as string}
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
