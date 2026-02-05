import { ColumnDef } from "@tanstack/react-table";
import { IForm } from "@/forms/types/formTypes";
import { Badge, Button, RecordTable, RecordTableInlineCell, RelativeDateDisplay, toast, useConfirm, useQueryState } from "erxes-ui";
import { useNavigate } from "react-router";
import { FormInstallScript } from "../FormInstallScript";
import { IconCalendarEvent, IconEdit, IconTag, IconTrash, IconUser } from "@tabler/icons-react";
import { useMutation } from "@apollo/client";
import { FORM_REMOVE } from "@/forms/graphql/formMutations";
import { MembersInline, SelectTags } from "ui-modules";

export const actionColumn: ColumnDef<IForm> = {
  accessorKey: 'actions',
  id: 'actions',
  cell: ({ cell }) => {
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
              `/settings/frontline/forms/${cell.row.original.channelId}/${cell.row.original._id}`,
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
};

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
          removeForm({ variables: { id: formId } });
        });
      }}
      disabled={loading}
    >
      <IconTrash />
    </Button>
  );
};

export const formColumns: ColumnDef<IForm>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    cell: ({ cell }) => {
      const navigate = useNavigate();

      return (
        <RecordTableInlineCell>
          <RecordTableInlineCell.Anchor
            onClick={() => {
              navigate(
                `/settings/frontline/forms/${cell.row.original.channelId}/${cell.row.original._id}`,
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
  actionColumn,
];