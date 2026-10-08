import { IconAlertTriangle, IconLink } from '@tabler/icons-react';
import { Alert, Button, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useVoucherBirthdayReward } from '../hooks/useVoucherBirthdayReward';
import { BirthdayRewardRow } from './BirthdayRewardRow';

// A voucher campaign's own birthday hand-out, set up from the campaign.
export const VoucherBirthdayReward = ({
  campaignId,
}: {
  campaignId: string;
}) => {
  const { t } = useTranslation('loyalty');
  const { reward, loading, error, connecting, connect, unlimited } =
    useVoucherBirthdayReward(campaignId);

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-muted-foreground">
        {t('birthday-reward-hint')}
      </p>

      {unlimited && (
        <Alert variant="warning">
          <IconAlertTriangle />
          <Alert.Title>{t('birthday-reward-unlimited')}</Alert.Title>
        </Alert>
      )}

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {loading && !reward && <Skeleton className="h-9 w-full" />}

      {reward && <BirthdayRewardRow reward={reward} />}

      {!reward && !loading && !error && (
        <Button
          type="button"
          className="self-start"
          disabled={connecting}
          onClick={connect}
        >
          <IconLink />
          {connecting
            ? t('birthday-reward-connecting')
            : t('birthday-reward-connect')}
        </Button>
      )}
    </div>
  );
};
