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
        title: t('error'),
        description: t('form-id-missing'),
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: title
        ? t('confirm-delete-form-title', { title })
        : t('confirm-delete-this-form'),
    }).then(async () => {
      try {
        await removeForm([formId]);
        toast({
          title: t('success'),
          variant: 'success',
          description: t('form-deleted-successfully'),
        });
      } catch (e: any) {
        toast({
          title: t('error'),
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
      {loading ? <Spinner /> : <IconTrash />} {t('delete')}
    </DropdownMenu.Item>
  );
};
