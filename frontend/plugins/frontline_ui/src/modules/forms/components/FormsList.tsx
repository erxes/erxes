import { useParams } from 'react-router-dom';
import { useFormsList } from '../hooks/useFormsList';
import {
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  toast,
  useConfirm,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { IForm } from '../types/formTypes';
import {
  IconCalendarEvent,
  IconCircles,
  IconDots,
  IconEdit,
  IconLabel,
  IconTag,
  IconToggleRight,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { MembersInline, SelectTags } from 'ui-modules';
import { useMutation } from '@apollo/client';
import { FormInstallScript } from './FormInstallScript';
import { FORM_REMOVE } from '../graphql/formMutations';
import { ChannelsInline } from '@/inbox/channel/components/ChannelsInline';
import { Link } from 'react-router-dom';

export const FormsList = () => {
  const { channelId } = useParams();

  const { forms, loading, handleFetchMore, pageInfo } = useFormsList({
    variables: {
      channelId: channelId || '',
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

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
    </RecordTable.Provider>
  );
};

const formsColumns: ColumnDef<IForm>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: () => <RecordTable.InlineHead label="Name" icon={IconLabel} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Link to={`/frontline/forms/${cell.row.original._id}`}>
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

  {
    id: 'action',
    header: () => <RecordTable.InlineHead label="Action" icon={IconDots} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <FormInstallScript
            formId={cell.row.original._id}
            channelId={cell.row.original.channelId}
          />
          <Button variant="outline" size="icon" asChild>
            <Link to={`/frontline/forms/${cell.row.original._id}`}>
              <IconEdit />
            </Link>
          </Button>
          <RemoveForm
            formId={cell.row.original._id}
            title={cell.row.original.name}
          />
        </RecordTableInlineCell>
      );
    },
  },
];

export const RemoveForm = ({
  formId,
  title,
}: {
  formId: string;
  title: string;
}) => {
  const [removeForm, { loading }] = useMutation(FORM_REMOVE, {
    refetchQueries: ['Forms'],
    onCompleted() {
      toast({
        title: `Form "${title}" removed`,
        variant: 'success',
      });
    },
  });
  const { confirm } = useConfirm();
  return (
    <Button
      variant="secondary"
      className="text-destructive bg-destructive/10 hover:bg-destructive/20"
      size="icon"
      onClick={() => {
        confirm({
          message: `Are you sure you want to remove "${title}" form?`,
        }).then(() => {
          removeForm({ variables: { _ids: [formId] } });
        });
      }}
      disabled={loading}
    >
      <IconTrash />
    </Button>
  );
};
