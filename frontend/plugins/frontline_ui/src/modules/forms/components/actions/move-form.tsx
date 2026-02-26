import { GET_FORMS_LIST } from "@/forms/graphql/formQueries";
import { useFormEdit } from "@/forms/hooks/useFormEdit";
import { SelectChannel } from "@/inbox/channel/components/SelectChannel";
import { IconArrowBarToRight } from "@tabler/icons-react";
import { DropdownMenu, toast } from "erxes-ui";

type Props = {
  formId: string;
  channelId: string;
  setOpen: (open: boolean) => void;
  name: string;
  type: string;
}

export const MoveFormToChannel = ({
  formId,
  channelId,
  setOpen,
  name,
  type,
}: Props) => {
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
  };

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <IconArrowBarToRight />
        Move to Channel
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="min-w-56" sideOffset={8}>
          <SelectChannel.DropDownContent
            channelId={channelId}
            onValueChange={(value) => {
              onSelect(value);
            }}
          />
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};