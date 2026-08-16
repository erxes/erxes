import { IconLockOpen } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ApprovalLockReleaseButton = ({
  canRelease,
  loading,
  onRelease,
}: {
  canRelease: boolean;
  loading: boolean;
  onRelease: () => void;
}) => {
  const { t } = useTranslation('approval');

  return (
    <Button
      variant="outline"
      disabled={!canRelease || loading}
      onClick={onRelease}
    >
      {loading ? <Spinner /> : <IconLockOpen />}
      {canRelease ? t('unlock') : t('locked')}
    </Button>
  );
};
