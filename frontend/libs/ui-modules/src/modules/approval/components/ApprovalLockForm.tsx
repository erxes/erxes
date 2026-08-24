import { Label, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember } from '../../team-members';
import { ApprovalLockFormController } from '../hooks/useApprovalLockForm';

export const ApprovalLockForm = ({
  form,
}: {
  form: ApprovalLockFormController;
}) => {
  const { t } = useTranslation('approval');
  const {
    allowedUserIds,
    approverScope,
    approvalMode,
    hasAllowedUsers,
    canSelectApprovalMode,
    handleAllowedUsersChange,
    handleApproverScopeChange,
    handleApprovalModeChange,
  } = form;

  return (
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
            <ToggleGroup.Item value="lockerAndAllowedUsers" className="flex-1">
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
            onValueChange={handleApprovalModeChange}
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
  );
};
