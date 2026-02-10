import { ColumnDef, Cell } from "@tanstack/react-table";
import { IForm } from "@/forms/types/formTypes";
import { Badge, Button, Dialog, DropdownMenu, RecordTable, RecordTableInlineCell, RelativeDateDisplay, Spinner, toast, useConfirm, useToast } from "erxes-ui";
import { useNavigate } from "react-router";
import { IconArrowBarToRight, IconCalendarEvent, IconCheck, IconCode, IconCopy, IconEdit, IconSquareToggle, IconTag, IconTrash, IconUser } from "@tabler/icons-react";
import { MembersInline, SelectTags } from "ui-modules";
import { useState } from "react";
import { REACT_APP_WIDGETS_URL } from "@/utils";
import { useRemoveForm } from "@/forms/hooks/useRemoveForm";
import { SelectChannel } from "@/inbox/channel/components/SelectChannel";
import { useFormEdit } from "@/forms/hooks/useFormEdit";
import { GET_FORMS_LIST } from "@/forms/graphql/formQueries";
import { useFormToggleStatus } from "@/forms/hooks/useFormToggleStatus";
import { FormStatus } from "./filters/FormStatus";

export function FormInstallScript({ formId, setOpen }: { formId: string, setOpen: (open: boolean) => void }) {
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const API = REACT_APP_WIDGETS_URL;
  const script = `<script>
  window.erxesSettings = {
    form: {
      formId: ${JSON.stringify(formId)},
    },
  };

  (function () {
    var script = document.createElement("script");
    script.src = "${API}/formBundle.js";
    script.async = true;
    var entry = document.getElementsByTagName("script")[0];
    entry.parentNode.insertBefore(script, entry);
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(script)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setOpen(false);
        }, 3000);
      })
      .catch(() => {
        toast({
          title: 'Failed to copy script',
          description: 'Please try again',
          variant: 'destructive',
        });
      });
  };

  return (
    <>
      <DropdownMenu.Item
        onSelect={(e) => {
          e.preventDefault();
          setDialogOpen(true);
        }}
      >
        <IconCode /> Install Script
      </DropdownMenu.Item>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content className="max-w-2xl">
          <Dialog.Header>
            <Dialog.Title>Installation Script</Dialog.Title>
            <Dialog.Description>
              Copy and paste this script into your website's HTML, just before
              the closing {'</body>'} tag.
            </Dialog.Description>
          </Dialog.Header>

          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{script}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <IconCheck className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <Badge variant="info" className="block w-full h-auto p-3">
              <h4 className="font-medium text-sm mb-2">Installation Steps:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Copy the script above</li>
                <li>Paste it into your website's HTML</li>
                <li>Place it just before the closing {'</body>'} tag</li>
                <li>The form widget will appear on your site</li>
              </ol>
            </Badge>
          </div>

          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}

export function FormToggleStatus({ formId, status, setOpen }: { formId: string, status: string, setOpen: (open: boolean) => void }) {
  const { toggleStatus, loading } = useFormToggleStatus();

  const onSelect = () => {
    toggleStatus({
      variables: {
        ids: [formId],
      },
      refetchQueries: [GET_FORMS_LIST],
      onCompleted: () => {
        setOpen(false);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  }

  return (
    <DropdownMenu.Item onSelect={onSelect}>
      <IconSquareToggle />
      {status === "active" ? "Archive" : "Unarchive"}
    </DropdownMenu.Item>
  )
}

export const MoveFormToChannel = ({ formId, channelId, setOpen, name, type }: { formId: string, channelId: string, setOpen: (open: boolean) => void, name: string, type: string }) => {
  const { editForm, loading } = useFormEdit();

  const onSelect = (id: string) => {
    editForm({
      variables: {
        id: formId,
        name,
        type,
        channelId: id,
      },
      refetchQueries: [GET_FORMS_LIST],
      onCompleted: () => {
        setOpen(false);
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Form moved successfully',
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
  }

  return (

    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <IconArrowBarToRight />
        Move to Channel
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="min-w-56" sideOffset={8}>
          <SelectChannel.DropDownContent channelId={channelId} onValueChange={(value) => {
            onSelect(value)
          }} />
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  )
}

export const FormsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IForm, unknown>;
}) => {
  const { _id, status } = cell.row.original;
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
        <FormInstallScript formId={_id} setOpen={setOpen} />
        <DropdownMenu.Item
          onSelect={() => {
            navigate(
              `/settings/frontline/forms/${cell.row.original.channelId}/${cell.row.original._id}`,
            );
          }}
        >
          <IconEdit /> Edit
        </DropdownMenu.Item>
        <FormToggleStatus formId={_id} status={status} setOpen={setOpen} />
        <MoveFormToChannel formId={_id} channelId={cell.row.original.channelId || ''} setOpen={setOpen} name={cell.row.original.name} type={cell.row.original.type} />
        <DropdownMenu.Item disabled={loading} onSelect={handleDelete} className="text-destructive">
          {loading ? <Spinner /> : <IconTrash />} Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const MoreColumn: ColumnDef<IForm> = {
  id: 'more',
  size: 30,
  cell: FormsMoreColumnCell,
}

export const formColumns: ColumnDef<IForm>[] = [
  MoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IForm>,
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
    accessorKey: 'channelId',
    header: () => <RecordTable.InlineHead label="Channel" />,
    id: 'channelId',
    cell: ({ cell }) => {
      const { channel, _id, name, type } = cell.row.original;
      const { editForm } = useFormEdit();

      const onValueChange = (value: string | string[]) => {
        editForm(
          {
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
          }
        );
      }

      return (
        <SelectChannel.InlineCell
          value={channel?._id}
          onValueChange={onValueChange}
        />
      );
    },
  },
  {
    accessorKey: 'status',
    id: 'status',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <FormStatus.Badge status={cell.getValue() as string} />
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