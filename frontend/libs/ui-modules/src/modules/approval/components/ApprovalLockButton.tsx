import { IconLock, IconLockOpen } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Label,
  Spinner,
  ToggleGroup,
  useToast,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules/states';
import { SelectMember } from '../../team-members';
import { useApprovalLockActions, useApprovalLockState } from '../hooks';
import {
  ApprovalApproverScope,
  ApprovalLockState,
  ApprovalMode,
  ApprovalLockVariables,
} from '../types';

type ApprovalLockButtonProps = ApprovalLockVariables & {
  state?: ApprovalLockState;
  onChanged?: () => void;
};

export const ApprovalLockButton = ({
  state,
  onChanged,
  ...variables
}: ApprovalLockButtonProps) => {
  const { t } = useTranslation('approval');
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserState);
  const [open, setOpen] = useState(false);
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [approverScope, setApproverScope] =
    useState<ApprovalApproverScope>('lockerOnly');
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('firstWins');
  const { state: fetchedState, refetch } = useApprovalLockState(variables, {
    skip: Boolean(state),
  });
  const { createLock, releaseLock, loading } = useApprovalLockActions();
  const currentState = state || fetchedState;
  const lock = currentState?.lock;
  const isLocked = currentState?.locked === true;
  const canRelease = Boolean(lock && lock.lockedBy === currentUser?._id);
  const hasAllowedUsers = allowedUserIds.length > 0;
  const canSelectApprovalMode =
    hasAllowedUsers && approverScope === 'lockerAndAllowedUsers';

  const handleChanged = async () => {
    if (!state) {
      await refetch();
    }
    onChanged?.();
  };

  const handleAllowedUsersChange = (value: string | string[] | null) => {
    const nextAllowedUserIds = Array.isArray(value) ? value : [];

    setAllowedUserIds(nextAllowedUserIds);

    if (!nextAllowedUserIds.length) {
      setApproverScope('lockerOnly');
      setApprovalMode('firstWins');
    }
  };

  const handleApproverScopeChange = (value: string) => {
    if (!value) {
      return;
    }

    const nextApproverScope = value as ApprovalApproverScope;

    setApproverScope(nextApproverScope);

    if (nextApproverScope !== 'lockerAndAllowedUsers') {
      setApprovalMode('firstWins');
    }
  };

  const handleCreateLock = async () => {
    try {
      const resolvedApproverScope = hasAllowedUsers
        ? approverScope
        : 'lockerOnly';
      const resolvedApprovalMode =
        resolvedApproverScope === 'lockerAndAllowedUsers'
          ? approvalMode
          : 'firstWins';
      const ownerId = variables.ownerId || currentUser?._id;

      if (!ownerId) {
        toast({
          title: t('lock-failed'),
          variant: 'destructive',
        });

        return;
      }

      await createLock({
        contentType: variables.contentType,
        contentTypeId: variables.contentId,
        ownerId,
        allowedUserIds,
        scope: resolvedApproverScope,
        mode: resolvedApprovalMode,
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

  const handleReleaseLock = async () => {
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

  if (isLocked) {
    return (
      <Button
        variant="outline"
        disabled={!canRelease || loading}
        onClick={handleReleaseLock}
      >
        {loading ? <Spinner /> : <IconLockOpen />}
        {canRelease ? t('unlock') : t('locked')}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <IconLock />
          {t('lock')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>{t('lock-dialog-title')}</Dialog.Title>
          <Dialog.Description>
            {t('lock-dialog-description')}
          </Dialog.Description>
        </Dialog.Header>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>{t('allowed-users')}</Label>
            <SelectMember
              mode="multiple"
              value={allowedUserIds}
              onValueChange={handleAllowedUsersChange}
              placeholder={t('select-users')}
            />
          </div>
          {hasAllowedUsers && (
            <div className="space-y-2">
              <Label>{t('approver-scope')}</Label>
              <ToggleGroup
                type="single"
                value={approverScope}
                onValueChange={handleApproverScopeChange}
                variant="outline"
                className="w-full"
              >
                <ToggleGroup.Item value="lockerOnly" className="flex-1">
                  {t('locker-only')}
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="lockerAndAllowedUsers"
                  className="flex-1"
                >
                  {t('locker-and-allowed')}
                </ToggleGroup.Item>
              </ToggleGroup>
            </div>
          )}
          {canSelectApprovalMode && (
            <div className="space-y-2">
              <Label>{t('approval-mode')}</Label>
              <ToggleGroup
                type="single"
                value={approvalMode}
                onValueChange={(value) =>
                  value && setApprovalMode(value as ApprovalMode)
                }
                variant="outline"
                className="w-full"
              >
                <ToggleGroup.Item value="firstWins" className="flex-1">
                  {t('first-wins')}
                </ToggleGroup.Item>
                <ToggleGroup.Item value="unanimous" className="flex-1">
                  {t('unanimous')}
                </ToggleGroup.Item>
              </ToggleGroup>
            </div>
          )}
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost">{t('cancel')}</Button>
          </Dialog.Close>
          <Button disabled={loading} onClick={handleCreateLock}>
            {loading ? <Spinner /> : <IconLock />}
            {t('lock')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
