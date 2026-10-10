import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { SafeRelativeDate } from '../../components/SafeRelativeDate';
import { tierLogSource, tierLogTierName } from '../hooks/useLoyaltyTierLogs';
import { ILoyaltyTierLog } from '../types';

// One tier change: wallet, from → to, when, what moved it and who.
export const LoyaltyTierLogItem = ({
  log,
  ownerName,
}: {
  log: ILoyaltyTierLog;
  // Shown where the list spans owners, as on a record.
  ownerName?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const up = log.direction === 'up';
  const actorId = log.createdBy || log.createdVia?.actorId;

  return (
    <div className="flex flex-col gap-1 rounded-md border px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        {up ? (
          <IconArrowUp className="size-4 text-success" />
        ) : (
          <IconArrowDown className="size-4 text-destructive" />
        )}
        <span className="text-muted-foreground">
          {log.accountType?.name || t('loyalty-account-default-balance')}
        </span>
        <Badge variant="secondary">
          {tierLogTierName(log, log.fromTier) || t('loyalty-tier-none')}
        </Badge>
        →
        <Badge variant={up ? 'success' : 'secondary'}>
          {tierLogTierName(log, log.toTier) || t('loyalty-tier-none')}
        </Badge>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          <SafeRelativeDate value={log.createdAt} />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {ownerName && (
          <>
            <span className="truncate">{ownerName}</span>
            <span>·</span>
          </>
        )}
        <span>
          {t(`loyalty-tier-via-${tierLogSource(log)}`, {
            name: log.createdVia?.sourceName || log.targetName || '',
          })}
        </span>
        {actorId && <MembersInline memberIds={[actorId]} placeholder="—" />}
      </div>
    </div>
  );
};
