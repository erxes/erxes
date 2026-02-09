import { GET_FORMS_LIST } from '@/forms/graphql/formQueries';
import { useFormToggleStatus } from '@/forms/hooks/useFormToggleStatus';
import { IconSquareToggle } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, DropdownMenu, Spinner, toast, useConfirm } from 'erxes-ui';

export const FormStatusToggle = ({
  formIds,
  rows,
}: {
  formIds: string[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();

  const { toggleStatus, loading } = useFormToggleStatus();

  const handleToggleStatus = (formIds: string[], status?: string) => {
    confirm({
      message: `Are you sure you want to change selected form${formIds.length === 1 ? '' : 's'} status?`,
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
          title: 'Success',
          variant: 'success',
          description: `${formIds.length} Form${formIds.length === 1 ? '' : 's'} status changed successfully`,
        });
      } catch (e: any) {
        toast({
          title: 'Error',
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
          Status
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={15} align='end'>
        <DropdownMenu.Item onClick={() => handleToggleStatus(formIds, 'archived')}>
          Archive
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => handleToggleStatus(formIds, 'active')}>
          Activate
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
