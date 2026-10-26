import { useMutation } from '@apollo/client';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';

import {
  AGENTS_PINNED_THREADS,
  AGENTS_THREADS,
  AGENTS_THREAD_REMOVE,
  AGENTS_THREAD_UPDATE,
} from '../graphql/threads';
import type {
  IAgentsThreadRemoveData,
  IAgentsThreadRemoveVariables,
  IAgentsThreadUpdateData,
  IAgentsThreadUpdateVariables,
} from '../graphql/threads';

export interface IUseAgentsThreadActionsResult {
  rename: (threadId: string, title: string) => Promise<boolean>;
  setPinned: (threadId: string, pinned: boolean) => Promise<boolean>;
  /** Resolves `true` only when the delete actually succeeded. */
  remove: (threadId: string) => Promise<boolean>;
  busy: boolean;
}

/**
 * Shared thread mutations (rename, pin, delete) used by the thread list,
 * the page header, and the side-panel header. Every call refetches both
 * thread list queries by operation name and reports through toasts.
 */
export const useAgentsThreadActions = (): IUseAgentsThreadActionsResult => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [busy, setBusy] = useState(false);

  const [updateThread] = useMutation<
    IAgentsThreadUpdateData,
    IAgentsThreadUpdateVariables
  >(AGENTS_THREAD_UPDATE);

  const [removeThread] = useMutation<
    IAgentsThreadRemoveData,
    IAgentsThreadRemoveVariables
  >(AGENTS_THREAD_REMOVE);

  const run = useCallback(
    async (
      work: () => Promise<unknown>,
      successTitle: string,
      failureTitle: string,
    ): Promise<boolean> => {
      setBusy(true);
      try {
        await work();
        toast({ title: successTitle });
        return true;
      } catch (mutationError) {
        toast({
          title: failureTitle,
          description:
            mutationError instanceof Error
              ? mutationError.message
              : undefined,
          variant: 'destructive',
        });
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const rename = useCallback(
    (threadId: string, title: string) =>
      run(
        () =>
          updateThread({
            variables: { threadId, title },
            refetchQueries: [
              { query: AGENTS_THREADS },
              { query: AGENTS_PINNED_THREADS },
            ],
          }),
        t('conversation-renamed', 'Conversation renamed'),
        t('rename-failed', 'Failed to rename the conversation'),
      ),
    [run, updateThread, t],
  );

  const setPinned = useCallback(
    (threadId: string, pinned: boolean) =>
      run(
        () =>
          updateThread({
            variables: { threadId, pinned },
            refetchQueries: [
              { query: AGENTS_THREADS },
              { query: AGENTS_PINNED_THREADS },
            ],
          }),
        pinned
          ? t('conversation-pinned', 'Conversation pinned')
          : t('conversation-unpinned', 'Conversation unpinned'),
        t('pin-failed', 'Failed to update the conversation'),
      ),
    [run, updateThread, t],
  );

  const remove = useCallback(
    (threadId: string) =>
      run(
        () =>
          removeThread({
            variables: { threadId },
            refetchQueries: [
              { query: AGENTS_THREADS },
              { query: AGENTS_PINNED_THREADS },
            ],
          }),
        t('conversation-deleted', 'Conversation deleted'),
        t('delete-failed', 'Failed to delete the conversation'),
      ),
    [run, removeThread, t],
  );

  return { rename, setPinned, remove, busy };
};
