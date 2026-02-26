import { useRemoveForm } from "@/forms/hooks/useRemoveForm";
import { IconTrash } from "@tabler/icons-react";
import { DropdownMenu, Spinner, useConfirm, useToast } from "erxes-ui";

export const RemoveForm = ({
  formId,
  title,
}: {
  formId: string;
  title?: string;
}) => {
  const { removeForm, loading } = useRemoveForm();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!formId) {
      toast({
        title: 'Error',
        description: 'Form ID is missing',
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: title ? `Are you sure you want to delete "${title}"?` : 'Are you sure you want to delete this form?',
    }).then(async () => {
      try {
        await removeForm([formId]);
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
    <DropdownMenu.Item
      disabled={loading}
      onSelect={handleDelete}
      className="text-destructive"
    >
      {loading ? <Spinner /> : <IconTrash />} Delete
    </DropdownMenu.Item>
  );
};