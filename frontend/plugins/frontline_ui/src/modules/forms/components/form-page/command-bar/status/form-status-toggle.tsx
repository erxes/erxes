import { GET_FORMS_LIST } from '@/forms/graphql/formQueries';
import { useFormToggleStatus } from '@/forms/hooks/useFormToggleStatus';
import { IconSquareToggle } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, DropdownMenu, Spinner, toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const FormStatusToggle = ({
  formIds,
  rows,
}: {
  formIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();

  const { toggleStatus, loading } = useFormToggleStatus();

  const handleToggleStatus = (formIds: string[], status?: string) => {
    confirm({
      message: t('confirm-change-forms-status', { count: formIds.length }),
    }).then(async () => {
      try {
        await toggleStatus({
          variables: {
            ids: formIds,
            status,
          },
          refetchQueries: [GET_FORMS_LIST],
        });
        rows.forEach((row) => {
          row.toggleSelected(false);
        });
        toast({
          title: t('success'),
          variant: 'success',
          description: t('forms-status-changed', { count: formIds.length }),
        });
      } catch (e: any) {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          disabled={loading}
        >
          {loading ? <Spinner /> : <IconSquareToggle />}
          {t('status')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={15} align='end'>
        <DropdownMenu.Item onClick={() => handleToggleStatus(formIds, 'archived')}>
          {t('archive')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => handleToggleStatus(formIds, 'active')}>
          {t('activate')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
