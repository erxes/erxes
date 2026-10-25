import { useRef, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { usePermissionCheck } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { POST_EXECUTION, REMOVE_EXECUTION, UNDO_EXECUTION } from './graphql';
import {
  canRunExecutionAction,
  ExecutionAction,
  ExecutionActionRecord,
  runExecutionAction,
} from './executionActions';

export const useExecutionActions = () => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const client = useApolloClient();
  const { hasActionPermission } = usePermissionCheck();
  const [post] = useMutation(POST_EXECUTION);
  const [undo] = useMutation(UNDO_EXECUTION);
  const [remove] = useMutation(REMOVE_EXECUTION);
  const [loading, setLoading] = useState(false);
  const locked = useRef(false);
  const canRun = (action: ExecutionAction, rows: ExecutionActionRecord[]) =>
    rows.length > 0 &&
    rows.every((row) =>
      canRunExecutionAction(
        action,
        row,
        hasActionPermission('manageJobExecutions'),
        hasActionPermission('removeJobExecutions'),
      ),
    );
  const run = async (
    action: ExecutionAction,
    rows: ExecutionActionRecord[],
    onProcessed?: (ids: string[]) => void,
  ): Promise<void> => {
    if (locked.current || !canRun(action, rows)) return;
    locked.current = true;
    const label = {
      post: 'production-post',
      undo: 'production-undo',
      remove: 'delete',
    }[action];
    const messageKey = {
      post: 'production-confirm-post',
      undo: 'production-confirm-undo',
      remove: 'production-confirm-delete',
    }[action];
    const needsUndo =
      action === 'remove' &&
      rows.some((row) => ['posted', 'error'].includes(row.status));
    try {
      await confirm({
        message: [
          needsUndo ? t('production-confirm-undo') : '',
          t(messageKey),
          `${rows.length} ${t('selected')}`,
        ]
          .filter(Boolean)
          .join(' '),
        options: { okLabel: t(label), cancelLabel: t('cancel') },
      });
    } catch {
      locked.current = false;
      return;
    }
    setLoading(true);
    const completed: string[] = [];
    try {
      const writers = { post, undo, remove };
      await rows.reduce<Promise<void>>(
        (previous, row) =>
          previous.then(async () => {
            await runExecutionAction(action, row, (kind, id) =>
              writers[kind]({ variables: { _id: id } }),
            );
            completed.push(row._id);
          }),
        Promise.resolve(),
      );
      toast({ title: t('success'), description: t('production-updated') });
    } catch (error) {
      toast({
        title: t('error'),
        description: `${
          error instanceof Error ? error.message : String(error)
        } (${completed.length}/${rows.length})`,
        variant: 'destructive',
      });
    } finally {
      onProcessed?.(completed);
      try {
        await client.refetchQueries({ include: ['AccountingJobExecutions'] });
      } catch (error) {
        toast({
          title: t('error'),
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
      }
      setLoading(false);
      locked.current = false;
    }
  };
  return { loading, canRun, run };
};
