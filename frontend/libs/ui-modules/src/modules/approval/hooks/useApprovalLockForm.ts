import { useState } from 'react';
import { ApprovalApproverScope, ApprovalMode } from '../types';

export type ApprovalLockFormValues = {
  allowedUserIds: string[];
  scope: ApprovalApproverScope;
  mode: ApprovalMode;
};

export const useApprovalLockForm = () => {
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [approverScope, setApproverScope] =
    useState<ApprovalApproverScope>('lockerOnly');
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('firstWins');

  const hasAllowedUsers = allowedUserIds.length > 0;
  const canSelectApprovalMode =
    hasAllowedUsers && approverScope === 'lockerAndAllowedUsers';

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

  const handleApprovalModeChange = (value: string) => {
    if (!value) {
      return;
    }

    setApprovalMode(value as ApprovalMode);
  };

  const getValues = (): ApprovalLockFormValues => {
    const scope: ApprovalApproverScope = hasAllowedUsers
      ? approverScope
      : 'lockerOnly';

    return {
      allowedUserIds,
      scope,
      mode: scope === 'lockerAndAllowedUsers' ? approvalMode : 'firstWins',
    };
  };

  return {
    allowedUserIds,
    approverScope,
    approvalMode,
    hasAllowedUsers,
    canSelectApprovalMode,
    handleAllowedUsersChange,
    handleApproverScopeChange,
    handleApprovalModeChange,
    getValues,
  };
};

export type ApprovalLockFormController = ReturnType<typeof useApprovalLockForm>;
