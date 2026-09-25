import { useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules/states';
import { ApprovalLockState, ApprovalLockVariables } from '../types';
import { useApprovalLockActions } from './useApprovalLockActions';
import { useApprovalLockForm } from './useApprovalLockForm';
import { useApprovalLockState } from './useApprovalLockState';

export type UseApprovalLockProps = ApprovalLockVariables & {
  state?: ApprovalLockState;
  onChanged?: () => void;
};

export const useApprovalLock = ({
  state,
  onChanged,
  ...variables
}: UseApprovalLockProps) => {
  const { t } = useTranslation('approval');
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserState);
  const [open, setOpen] = useState(false);
  const { state: fetchedState, refetch } = useApprovalLockState(variables, {
    skip: Boolean(state),
  });
  const { createLock, releaseLock, loading } = useApprovalLockActions();
  const form = useApprovalLockForm();

  const currentState = state || fetchedState;
  const lock = currentState?.lock;
  const isLocked = currentState?.locked === true;
  const canRelease = Boolean(lock && lock.lockedBy === currentUser?._id);

  const handleChanged = async () => {
    if (!state) {
      await refetch();
    }
    onChanged?.();
  };

  const onCreate = async () => {
    try {
      const ownerId = variables.ownerId || currentUser?._id;

      if (!ownerId) {
        toast({
          title: t('lock-failed'),
          variant: 'destructive',
        });

        return;
      }

      const { allowedUserIds, scope, mode } = form.getValues();

      await createLock({
        contentType: variables.contentType,
        contentTypeId: variables.contentId,
        ownerId,
        allowedUserIds,
        scope,
        mode,
      });
      toast({ title: t('lock-created'), variant: 'success' });
      setOpen(false);
      await handleChanged();
    } catch (error) {
      toast({
        title: t('lock-failed'),
        description:
          error instanceof Error ? error.message : t('unknown-error'),
        variant: 'destructive',
      });
    }
  };

  const onRelease = async () => {
    if (!lock) {
      return;
    }

    try {
      await releaseLock(lock._id);
      toast({ title: t('lock-released'), variant: 'success' });
      await handleChanged();
    } catch (error) {
      toast({
        title: t('release-failed'),
        description:
          error instanceof Error ? error.message : t('unknown-error'),
        variant: 'destructive',
      });
    }
  };

  return {
    open,
    setOpen,
    isLocked,
    canRelease,
    loading,
    form,
    onCreate,
    onRelease,
  };
};
