import { IconLock } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ApprovalLockState } from '../types';
import { ApprovalRequestAccessButton } from './ApprovalRequestAccessButton';

type ApprovalLockScreenProps = {
  state: ApprovalLockState;
  onRequestCompleted?: () => void;
};

export const ApprovalLockScreen = ({
  state,
  onRequestCompleted,
}: ApprovalLockScreenProps) => {
  const { t } = useTranslation('approval');
  const label = state.content?.label || t('this-record');

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconLock className="size-7" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-lg font-semibold">{t('locked-title')}</h2>
          <Badge variant="secondary">{t('locked')}</Badge>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          {t('locked-description', { label })}
        </p>
      </div>
      <ApprovalRequestAccessButton
        contentType={state.contentType}
        contentId={state.contentId}
        pendingRequest={state.pendingRequest}
        onCompleted={onRequestCompleted}
      />
    </div>
  );
};
