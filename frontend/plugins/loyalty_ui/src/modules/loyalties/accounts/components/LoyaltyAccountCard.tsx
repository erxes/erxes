import {
  IconHistory,
  IconLock,
  IconLockOpen,
  IconWallet,
} from '@tabler/icons-react';
import { Badge, Button, Card, Spinner, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoyaltyAccountFreeze } from '../hooks/useLoyaltyAccountFreeze';
import { useLoyaltyAccountOfOwner } from '../hooks/useLoyaltyAccountOfOwner';
import { useLoyaltyAccountPermissions } from '../hooks/useLoyaltyAccountPermissions';
import { TLoyaltyAccountStatus } from '../types';
import { FreezeAccountDialog } from './FreezeAccountDialog';
import { LoyaltyAccountTierSelect } from './LoyaltyAccountTierSelect';
import { LoyaltyTierHistoryDialog } from './LoyaltyTierHistoryDialog';

const STATUS_VARIANTS: Record<
  TLoyaltyAccountStatus,
  'success' | 'warning' | 'secondary'
> = {
  active: 'success',
  frozen: 'warning',
  closed: 'secondary',
};

export const LoyaltyAccountCard = ({
  ownerType,
  ownerId,
}: {
  ownerType?: string;
  ownerId?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const [freezing, setFreezing] = useState(false);
  const [tierHistoryOpen, setTierHistoryOpen] = useState(false);
  const { account, loading } = useLoyaltyAccountOfOwner({ ownerType, ownerId });
  const { unfreeze, loading: unfreezing } = useLoyaltyAccountFreeze();
  const { canFreeze } = useLoyaltyAccountPermissions();

  if (loading && !account) {
    return <Spinner containerClassName="py-6" />;
  }

  if (!account) {
    return (
      <Card className="bg-background px-4 py-3 text-xs text-muted-foreground">
        {t('loyalty-account-none-yet')}
      </Card>
    );
  }

  const onUnfreeze = () =>
    confirm({
      message: t('loyalty-account-unfreeze-confirm', {
        number: account.number,
      }),
    }).then(() => unfreeze(account._id));

  return (
    <Card className="bg-background px-4 py-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <IconWallet className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{account.number}</span>
        <Badge variant={STATUS_VARIANTS[account.status]}>
          {t(`loyalty-account-status-${account.status}`)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => setTierHistoryOpen(true)}
        >
          <IconHistory />
          {t('loyalty-tier-history')}
        </Button>
        {canFreeze && account.status === 'active' && (
          <Button variant="ghost" size="sm" onClick={() => setFreezing(true)}>
            <IconLock />
            {t('loyalty-account-freeze')}
          </Button>
        )}
        {canFreeze && account.status === 'frozen' && (
          <Button
            variant="ghost"
            size="sm"
            disabled={unfreezing}
            onClick={onUnfreeze}
          >
            <IconLockOpen />
            {t('loyalty-account-unfreeze')}
          </Button>
        )}
      </div>
      {account.status === 'frozen' && account.frozenReason && (
        <p className="text-xs text-muted-foreground">
          {t('reason')}: {account.frozenReason}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {account.balances.map((balance) => (
          <div key={balance.accountTypeId} className="flex flex-col px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {balance.accountType?.name ||
                  t('loyalty-account-default-balance')}
              </span>
              <span className="ml-auto text-xs font-semibold">
                {Number(balance.balance).toLocaleString()}
              </span>
              <LoyaltyAccountTierSelect
                accountId={account._id}
                balance={balance}
                disabled={account.status === 'closed'}
              />
            </div>
            {!!balance.pending && (
              <span className="text-xs text-muted-foreground">
                {t('loyalty-account-pending', {
                  amount: Number(balance.pending).toLocaleString(),
                })}
              </span>
            )}
            {balance.expiringSoon && (
              <span className="text-xs text-warning">
                {t('loyalty-account-expiring', {
                  amount: Number(balance.expiringSoon.amount).toLocaleString(),
                  date: new Date(
                    balance.expiringSoon.expiresAt,
                  ).toLocaleDateString(),
                })}
              </span>
            )}
          </div>
        ))}
      </div>
      <FreezeAccountDialog
        accountId={account._id}
        open={freezing}
        onOpenChange={setFreezing}
      />
      <LoyaltyTierHistoryDialog
        accountId={account._id}
        number={account.number}
        open={tierHistoryOpen}
        onOpenChange={setTierHistoryOpen}
      />
    </Card>
  );
};
