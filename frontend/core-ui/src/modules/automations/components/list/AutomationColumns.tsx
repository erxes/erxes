import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';
import { TAutomationRecordTableColumnDefData } from '@/automations/types';
import { useMutation } from '@apollo/client';
import { IconPointerBolt, IconShare } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  cn,
  Label,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Switch,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { SelectTags, TAutomationAction, TAutomationTrigger } from 'ui-modules';
import { AutomationRecordTableUserInlineCell } from '@/automations/components/list/AutomationRecordTableUserInlineCell';
import { AutomationRecordTableStatusInlineCell } from '@/automations/components/list/AutomationRecordTableStatusInlineCell';

const checkBoxColumn =
  RecordTable.checkboxColumn as ColumnDef<TAutomationRecordTableColumnDefData>;

export const automationColumns: ColumnDef<TAutomationRecordTableColumnDefData>[] =
  [
    checkBoxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label="Name" />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <Link to={`/automations/edit/${cell.row.original._id}`}>
            {cell.getValue() as string}
          </Link>
        </RecordTableInlineCell>
      ),
      minSize: 120,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <RecordTable.InlineHead label="Status" />,
      cell: ({ cell }) => {
        return <AutomationRecordTableStatusInlineCell cell={cell} />;
      },
      size: 80,
    },
    {
      id: 'triggers',
      accessorKey: 'triggers',
      header: () => <RecordTable.InlineHead label="Triggers" />,
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
      header: () => <RecordTable.InlineHead label="Actions" />,
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
      id: 'updatedUser',
      accessorKey: 'updatedUser',
      header: () => <RecordTable.InlineHead label="Last Updated By" />,
      cell: ({ cell }) => <AutomationRecordTableUserInlineCell cell={cell} />,
    },
    {
      id: 'createdUser',
      accessorKey: 'createdUser',
      header: () => <RecordTable.InlineHead label="Created By" />,
      cell: ({ cell }) => <AutomationRecordTableUserInlineCell cell={cell} />,
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: () => <RecordTable.InlineHead label="Last Updated At" />,
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
      header: () => <RecordTable.InlineHead label="Created At" />,
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
      id: 'tagIds',
      accessorKey: 'tagIds',
      header: () => <RecordTable.InlineHead label="Tags" />,
      cell: ({ cell }) => {
        const tagIds = cell.getValue() as string[];

        return (
          <SelectTags.InlineCell
            tagType="core:automation"
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
  ];
