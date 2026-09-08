import { useRemoveForm } from '@/forms/hooks/useRemoveForm';
import { IconTrash } from '@tabler/icons-react';
import { DropdownMenu, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const RemoveForm = ({
  formId,
  title,
}: {
  formId: string;
  title?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { removeForm, loading } = useRemoveForm();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!formId) {
      toast({
        title: t('error', 'Error'),
        description: t('form-id-missing', 'Form ID is missing'),
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: title
        ? t(
            'confirm-delete-form-title',
            'Are you sure you want to delete "{{title}}"?',
            { title },
          )
        : t(
            'confirm-delete-this-form',
            'Are you sure you want to delete this form?',
          ),
    }).then(async () => {
      try {
        await removeForm([formId]);
        toast({
          title: t('success', 'Success!'),
          variant: 'success',
          description: t(
            'form-deleted-successfully',
            'Form deleted successfully',
          ),
        });
      } catch (e: any) {
        toast({
          title: t('error', 'Error'),
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
      {loading ? <Spinner /> : <IconTrash />} {t('delete', 'Delete')}
    </DropdownMenu.Item>
  );
};
