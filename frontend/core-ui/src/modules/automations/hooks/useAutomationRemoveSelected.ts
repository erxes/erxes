import { useRemoveAutomations } from '@/automations/hooks/useRemoveAutomations';
import { IAutomation } from '@/automations/types';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { useConfirm, useToast } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Deleting the selected automations after a confirm, then clearing the selection. */
export const useAutomationRemoveSelected = (
  automationIds: string[],
  rows: Row<IAutomation>[],
) => {
  const { confirm } = useConfirm();
  const { t } = useTranslation('automations');
  const { removeAutomations, loading } = useRemoveAutomations();
  const { toast } = useToast();

  const remove = useCallback(
    () =>
      removeAutomations(automationIds, {
        onError: (e: ApolloError) =>
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          }),
        onCompleted: () => {
          rows.forEach((row) => row.toggleSelected(false));
          toast({
            title: t('success'),
            variant: 'success',
            description: t('automations-deleted'),
          });
        },
      }),
    [removeAutomations, automationIds, toast, t, rows],
  );

  const requestRemove = useCallback(
    () =>
      confirm({
        message: t('list-delete-selected-confirm', {
          count: automationIds.length,
        }),
      }).then(remove),
    [confirm, t, automationIds.length, remove],
  );

  return { removing: loading, requestRemove };
};
