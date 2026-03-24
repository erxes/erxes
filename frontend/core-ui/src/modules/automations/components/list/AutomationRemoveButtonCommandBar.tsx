import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Button, Spinner, useConfirm, useToast } from 'erxes-ui';
import { IAutomation } from '@/automations/types';
import { Row } from '@tanstack/table-core';
import { useRemoveAutomations } from '@/automations/hooks/useRemoveAutomations';

export const AutomationRemoveButtonCommandBar = ({
  automationIds,
  rows,
}: {
  automationIds: string[];
  rows: Row<IAutomation>[];
}) => {
  const { confirm } = useConfirm();
  const { removeAutomations, loading } = useRemoveAutomations();
  const { toast } = useToast();
  const onRemove = () => {
    confirm({
      message: `Are you sure you want to delete the ${automationIds.length} selected automations?`,
    }).then(() => {
      removeAutomations(automationIds, {
        onError: (e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          rows.forEach((row) => {
            row.toggleSelected(false);
          });
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Automations deleted successfully',
          });
        },
      });
    });
  };
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={onRemove}
    >
      {loading ? <Spinner /> : <IconTrash />}
      Delete
    </Button>
  );
};
