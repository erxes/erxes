import { useNavigate, useParams } from 'react-router-dom';
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
  IconDots,
  IconEdit,
  IconTag,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { MembersInline, SelectTags } from 'ui-modules';
import { useMutation } from '@apollo/client';
import { FormInstallScript } from './FormInstallScript';
import { FORM_REMOVE } from '../graphql/formMutations';

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

// {
//   "_id": "6fB2WR_dyRQZGowsAYgYp",
//   "createdDate": "2026-01-12T03:16:20.823Z",
//   "createdUserId": "FNeodJ2Dq71WrAQdlGi_c",
//   "name": "Merch Order",
//   "status": "active",
//   "tagIds": [],
//   "visibility": null,
//   "title": "Merch Order",
//   "__typename": "Form"
// },

const formsColumns: ColumnDef<IForm>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    cell: ({ cell }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { channelId } = useParams();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigate = useNavigate();
      return (
        <RecordTableInlineCell>
          <RecordTableInlineCell.Anchor
            onClick={() => {
              navigate(
                `/settings/frontline/forms/${channelId}/${cell.row.original._id}`,
              );
            }}
          >
            {cell.getValue() as string}
          </RecordTableInlineCell.Anchor>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    accessorKey: 'status',
    id: 'status',
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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { channelId } = useParams();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigate = useNavigate();
      return (
        <RecordTableInlineCell>
          <FormInstallScript formId={cell.row.original._id} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              navigate(
                `/settings/frontline/forms/${channelId}/${cell.row.original._id}`,
              );
            }}
          >
            <IconEdit />
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
