import { ReactNode } from 'react';
import {
  useApprovalLock,
  UseApprovalLockProps,
} from '../hooks/useApprovalLock';
import { ApprovalLockDialog } from './ApprovalLockDialog';
import { ApprovalLockReleaseButton } from './ApprovalLockReleaseButton';

export type ApprovalLockUnlockedRenderProps = {
  loading: boolean;
};

export type ApprovalLockLockedRenderProps = {
  canRelease: boolean;
  loading: boolean;
  onRelease: () => void;
};

type ApprovalLockButtonProps = UseApprovalLockProps & {
  whenUnlocked?: (props: ApprovalLockUnlockedRenderProps) => ReactNode;
  whenLocked?: (props: ApprovalLockLockedRenderProps) => ReactNode;
};

export const ApprovalLockButton = ({
  whenLocked,
  whenUnlocked,
  ...lockProps
}: ApprovalLockButtonProps) => {
  const {
    open,
    setOpen,
    isLocked,
    canRelease,
    loading,
    form,
    onCreate,
    onRelease,
  } = useApprovalLock(lockProps);

  if (isLocked) {
    return (
      whenLocked?.({ canRelease, loading, onRelease }) ?? (
        <ApprovalLockReleaseButton
          canRelease={canRelease}
          loading={loading}
          onRelease={onRelease}
        />
      )
    );
  }

  return (
    <ApprovalLockDialog
      form={form}
      loading={loading}
      onCreate={onCreate}
      onOpenChange={setOpen}
      open={open}
      trigger={whenUnlocked?.({ loading })}
    />
  );
};
