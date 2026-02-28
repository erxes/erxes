import { useNavigate, useParams } from 'react-router-dom';
import { useFormsList } from '../hooks/useFormsList';
import {
  Badge,
  DropdownMenu,
  Empty,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { IForm } from '../types/formTypes';
import {
  IconCalendarEvent,
  IconCircles,
  IconEdit,
  IconForms,
  IconLabel,
  IconTag,
  IconToggleRight,
  IconUser,
} from '@tabler/icons-react';
import { MembersInline, SelectTags } from 'ui-modules';
import { FormInstallScript } from './actions/install-form';
import { ChannelsInline } from '@/inbox/channel/components/ChannelsInline';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FormToggleStatus } from './actions/toggle-form';
import { RemoveForm } from './actions/remove-form';
import { FormsCreateButton } from './form-page/forms-create';
import { FormCommandBar } from './form-page/command-bar/form-command-bar';

export const FormsList = () => {
  const { id: channelId } = useParams<{ id: string }>();

  const { forms, loading, handleFetchMore, pageInfo } = useFormsList({
    variables: {
      channelId: channelId || undefined,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (forms?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconForms />
          </Empty.Media>
          <Empty.Title>No forms found</Empty.Title>
          <Empty.Description>Create a form to get started</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <FormsCreateButton />
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={formsColumns as unknown as ColumnDef<IForm>[]}
      data={forms || []}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={forms?.length}
        sessionKey={'forms_cursor'}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <FormCommandBar />
    </RecordTable.Provider>
  );
};

export const FormsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IForm, unknown>;
}) => {
  const { _id, status, channelId } = cell.row.original;
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="bottom" align="start">
        <FormInstallScript
          formId={_id}
          channelId={channelId}
          inActionBar={true}
        />
        <DropdownMenu.Item
          onSelect={() => {
            navigate(
              `/settings/frontline/channels/${cell.row.original.channelId}/forms/${cell.row.original._id}`,
            );
          }}
        >
          <IconEdit /> Edit
        </DropdownMenu.Item>
        <FormToggleStatus formId={_id} status={status} setOpen={setOpen} />
        <RemoveForm formId={_id} title={cell.row.original.name} />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const MoreColumn: ColumnDef<IForm> = {
  id: 'more',
  size: 30,
  cell: FormsMoreColumnCell,
};

const formsColumns: ColumnDef<IForm>[] = [
  MoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IForm>,
  {
    accessorKey: 'name',
    id: 'name',
    header: () => <RecordTable.InlineHead label="Name" icon={IconLabel} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/frontline/channels/${cell.row.original.channelId}/forms/${cell.row.original._id}`}
          >
            <RecordTableInlineCell.Anchor>
              {cell.getValue() as string}
            </RecordTableInlineCell.Anchor>
          </Link>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: () => (
      <RecordTable.InlineHead label="Status" icon={IconToggleRight} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge
            variant={cell.getValue() === 'active' ? 'success' : 'secondary'}
          >
            {cell.getValue() as string}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'channelId',
    id: 'channelId',
    header: () => <RecordTable.InlineHead label="Channel" icon={IconCircles} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <ChannelsInline
            channelIds={[cell.getValue() as string]}
            placeholder="No channel"
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'tagIds',
    id: 'tagIds',
    header: () => <RecordTable.InlineHead label="Tags" icon={IconTag} />,
    cell: ({ cell }) => {
      return (
        <SelectTags.InlineCell
          tagType="frontline:form"
          mode="multiple"
          value={cell.getValue() as string[]}
          targetIds={[cell.row.original._id]}
        />
      );
    },
  },

  {
    accessorKey: 'createdUserId',
    id: 'createdUserId',
    header: () => <RecordTable.InlineHead label="Created By" icon={IconUser} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <MembersInline memberIds={[cell.getValue() as string]} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'createdDate',
    id: 'createdDate',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconCalendarEvent} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
