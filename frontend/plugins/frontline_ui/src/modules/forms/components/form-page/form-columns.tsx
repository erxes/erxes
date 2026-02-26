import { ColumnDef, Cell } from "@tanstack/react-table";
import { IForm } from "@/forms/types/formTypes";
import { DropdownMenu, RecordTable, RecordTableInlineCell, RelativeDateDisplay, Spinner, toast, useConfirm, useToast } from "erxes-ui";
import { useNavigate } from "react-router";
import { IconCalendarEvent, IconCircles, IconEdit, IconLabel, IconTag, IconToggleRight, IconTrash, IconUser } from "@tabler/icons-react";
import { MembersInline, SelectTags } from "ui-modules";
import { useState } from "react";
import { useRemoveForm } from "@/forms/hooks/useRemoveForm";
import { FormStatus } from "./filters/FormStatus";
import { FormInstallScript } from "../actions/install-form";
import { FormToggleStatus } from "../actions/toggle-form";
import { MoveFormToChannel } from "../actions/move-form";
import { useFormEdit } from "@/forms/hooks/useFormEdit";
import { GET_FORMS_LIST } from "@/forms/graphql/formQueries";
import { SelectChannel } from "@/inbox/channel/components/SelectChannel";
import { RemoveForm } from "../actions/remove-form";

export const FormsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IForm, unknown>;
}) => {
  const { _id, status, channelId } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const { removeForm, loading } = useRemoveForm();

  const handleDelete = () => {
    if (!_id) {
      toast({
        title: 'Error',
        description: 'Form ID is missing',
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: 'Are you sure you want to delete this form?',
    }).then(async () => {
      try {
        await removeForm([_id]);
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Form deleted successfully',
        });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };
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
            navigate(`/frontline/forms/${cell.row.original._id}`);
          }}
        >
          <IconEdit /> Edit
        </DropdownMenu.Item>
        <FormToggleStatus formId={_id} status={status} setOpen={setOpen} />
        <MoveFormToChannel
          formId={_id}
          channelId={cell.row.original.channelId || ''}
          setOpen={setOpen}
          name={cell.row.original.name}
          type={cell.row.original.type}
        />
        <RemoveForm
          formId={_id}
          title={cell.row.original.name}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const MoreColumn: ColumnDef<IForm> = {
  id: 'more',
  size: 30,
  cell: FormsMoreColumnCell,
};

export const formColumns: ColumnDef<IForm>[] = [
  MoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IForm>,
  {
    accessorKey: 'name',
    id: 'name',
    header: () => <RecordTable.InlineHead label="Name" icon={IconLabel} />,
    cell: ({ cell }) => {
      const navigate = useNavigate();

      return (
        <RecordTableInlineCell>
          <RecordTableInlineCell.Anchor
            onClick={() => {
              navigate(`/frontline/forms/${cell.row.original._id}`);
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
    header: () => (
      <RecordTable.InlineHead label="Status" icon={IconToggleRight} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <FormStatus.Badge status={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'channelId',
    header: () => <RecordTable.InlineHead label="Channel" icon={IconCircles} />,
    id: 'channelId',
    cell: ({ cell }) => {
      const { channel, _id, name, type } = cell.row.original;
      const { editForm } = useFormEdit();

      const onValueChange = (value: string | string[]) => {
        editForm({
          variables: {
            id: _id,
            name,
            type,
            channelId: value,
          },
          refetchQueries: [GET_FORMS_LIST],
          onCompleted: () => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Form updated successfully',
            });
          },
          onError: (error) => {
            toast({
              title: 'Error',
              variant: 'destructive',
              description: error.message,
            });
          },
        });
      };

      return (
        <SelectChannel.InlineCell
          value={channel?._id}
          onValueChange={onValueChange}
        />
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
