import { useTranslation } from 'react-i18next';
import { ResumeSendingDialog } from '@/settings/email-ramp/components/ResumeSendingDialog';
import { useEmailRampStatus } from '@/settings/email-ramp/hooks/useEmailRamp';
import { IEmailRampStatus } from '@/settings/email-ramp/types';
import { IconAlertTriangle, IconPlayerPlay } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Alert, Badge, Button, Card, Skeleton, cn } from 'erxes-ui';
import { useState } from 'react';

const count = (value: number) => value.toLocaleString();

const rateTone = (status: IEmailRampStatus) => {
  const rate = status.lastRate ?? 0;

  if (rate >= status.haltRate) {
    return 'destructive' as const;
  }

  if (rate >= status.dropRate) {
    return 'warning' as const;
  }

  return 'success' as const;
};

const AllowanceCard = ({ status }: { status: IEmailRampStatus }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-ramp' });
  const remaining = Math.max(0, status.dailyBudget - status.usedToday);
  const used = status.dailyBudget
    ? Math.min(100, (status.usedToday / status.dailyBudget) * 100)
    : 0;

  return (
    <Card className="border">
      <Card.Header className="pb-3">
        <Card.Title className="text-base">{t('daily-allowance')}</Card.Title>
        <Card.Description>{t('daily-allowance-description')}</Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold">
            {count(status.usedToday)}
            <span className="text-muted-foreground text-base font-normal">
              {' '}
              / {count(status.dailyBudget)}
            </span>
          </span>
          <span className="text-sm text-muted-foreground">
            {t('left-today', {
              left: count(remaining),
            })}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${used}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {status.tiers.map((tier, index) => (
            <Badge
              key={tier}
              variant={index === status.tier ? 'default' : 'secondary'}
              className={cn(index > status.tier && 'text-muted-foreground')}
            >
              {count(tier)}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {t('step-of', {
              step: status.tier + 1,
              total: status.tiers.length,
            })}
          </span>
        </div>
      </Card.Content>
    </Card>
  );
};

const RateCard = ({ status }: { status: IEmailRampStatus }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-ramp' });

  return (
    <Card className="border">
      <Card.Header className="pb-3">
        <Card.Title className="text-base">{t('failure-rate')}</Card.Title>
        <Card.Description>
          {t('failure-rate-description', { windowDays: status.windowDays })}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold">
            {(status.lastRate ?? 0).toFixed(2)}%
          </span>
          <Badge variant={rateTone(status)}>
            {status.lastEvaluatedAt
              ? t('checked-at', {
                  time: dayjs(status.lastEvaluatedAt).format('HH:mm'),
                })
              : t('not-measured-yet')}
          </Badge>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">
              {t('step-up-under')}
            </dt>
            <dd className="font-medium">{status.advanceRate}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">
              {t('step-down-at')}
            </dt>
            <dd className="font-medium">{status.dropRate}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t('stop-at')}</dt>
            <dd className="font-medium">{status.haltRate}%</dd>
          </div>
        </dl>
      </Card.Content>
    </Card>
  );
};

const HaltAlert = ({
  status,
  onResume,
}: {
  status: IEmailRampStatus;
  onResume: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-ramp' });

  return (
    <Alert variant="destructive" className="items-center">
      <IconAlertTriangle />
      <div className="flex flex-col gap-1">
        <Alert.Title>{t('sending-stopped')}</Alert.Title>
        <Alert.Description>
          {status.haltReason ?? t('too-much-mail-failing')}{' '}
          {t('halt-description', {
            haltedAt: dayjs(status.haltedAt).format('MMM D, HH:mm'),
          })}
        </Alert.Description>
      </div>
      <Button size="sm" className="ml-auto" onClick={onResume}>
        <IconPlayerPlay className="size-4" />
        {t('resume')}
      </Button>
    </Alert>
  );
};

export const EmailRampPanel = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-ramp' });
  const { status, loading, error } = useEmailRampStatus();
  const [resuming, setResuming] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <IconAlertTriangle />
          <Alert.Title>{t('could-not-load')}</Alert.Title>
          <Alert.Description>
            {error?.message ?? t('no-status-returned')}
          </Alert.Description>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-auto p-6">
      {status.haltedAt && (
        <HaltAlert status={status} onResume={() => setResuming(true)} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <AllowanceCard status={status} />
        <RateCard status={status} />
      </div>

      <ResumeSendingDialog
        reason={status.haltReason}
        open={resuming}
        onOpenChange={setResuming}
      />
    </div>
  );
};
