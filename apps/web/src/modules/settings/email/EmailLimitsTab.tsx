import type { EmailLimits } from '@erxes/core-contract';
import { cn, Switch, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { zoneLabel } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';
import { HaltBanner } from './EmailHaltBanner';
import { OverviewSection } from '../integrations/IntegrationLayout';
import { useEmailLimits, useRampToggle } from './useEmailLimits';

const percentText = (rate: number) => `${(rate * 100).toFixed(rate && rate < 0.1 ? 1 : 0)}%`;

/** The rate bar's scale: a bit past the halt line, so the line shows with room after it. */
const scaleOf = (limits: EmailLimits) => limits.haltAt * 1.5;

const at = (value: number, scale: number) => `${Math.min(value / scale, 1) * 100}%`;

/** Today's count against today's limit, and what is held until the next window. */
const TodayUsage = ({ limits }: { limits: EmailLimits }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const fmt = useFormat();
  const used: Record<`--${string}`, string> = { '--used': at(limits.sentToday, limits.limit) };
  const zone = zoneLabel(useSession().organization.timezone);

  return (
    <OverviewSection title={t('today', 'Today ({{zone}})', { zone })}>
      <div className="space-y-1.5 rounded-lg border p-4">
        <progress className="sr-only" max={limits.limit} value={limits.sentToday} />
        <div className="h-2 overflow-hidden rounded-full bg-muted" style={used} aria-hidden>
          <span
            className={cn(
              'block h-full w-(--used) rounded-full',
              limits.sentToday >= limits.limit ? 'bg-warning' : 'bg-primary',
            )}
          />
        </div>
        <p className="text-sm tabular-nums">
          {t('today-usage', '{{sent}} of {{limit}} emails', {
            sent: fmt.number(limits.sentToday),
            limit: fmt.number(limits.limit),
          })}
        </p>
        {limits.held > 0 && (
          <p className="text-xs text-muted-foreground">
            {t('held-note', '{{count}} held; the next allowance opens {{when}}', {
              count: limits.held,
              when: fmt.dateTime(limits.nextWindowAt),
            })}
          </p>
        )}
      </div>
    </OverviewSection>
  );
};

/** The steps of the daily limit, the current one marked, and what moves it up. */
const TierLadder = ({ limits }: { limits: EmailLimits }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const fmt = useFormat();
  const notBefore = limits.advanceNotBefore;

  return (
    <OverviewSection title={t('ladder', 'Daily limit')}>
      <ol className="grid grid-cols-5 gap-2">
        {limits.tiers.map((limit, index) => (
          <li
            key={limit}
            aria-current={index === limits.tier ? 'step' : undefined}
            className={cn(
              'rounded-lg border p-3 text-center',
              index === limits.tier && 'border-primary bg-primary/5',
            )}
          >
            <p className="text-xs text-muted-foreground">
              {t('step', 'Step {{step}}', { step: index + 1 })}
            </p>
            <p className="font-semibold tabular-nums">{fmt.number(limit)}</p>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        {limits.advanceSentNeeded === null
          ? t('top-step', 'This is the top step.')
          : t(
              'next-step',
              'It goes up a step once the window holds {{needed}} emails ({{sent}} so far) with under {{below}} bounces and complaints, at most once a day.',
              {
                needed: fmt.number(limits.advanceSentNeeded),
                sent: fmt.number(limits.windowSent),
                below: percentText(limits.advanceBelow),
              },
            )}
        {notBefore &&
          ` ${t('not-before', 'Not before {{when}}.', { when: fmt.dateTime(notBefore) })}`}
      </p>
    </OverviewSection>
  );
};

/** The window's bounce and complaint rate against the lines that move or halt the ramp. */
const Rates = ({ limits }: { limits: EmailLimits }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const fmt = useFormat();
  const scale = scaleOf(limits);

  const positions: Record<`--${string}`, string> = {
    '--rate': at(limits.rate, scale),
    '--advance': at(limits.advanceBelow, scale),
    '--down': at(limits.stepDownAt, scale),
    '--halt': at(limits.haltAt, scale),
  };

  const tone =
    limits.rate >= limits.stepDownAt
      ? 'bg-destructive'
      : limits.rate >= limits.advanceBelow
        ? 'bg-warning'
        : 'bg-success';

  return (
    <OverviewSection title={t('rates', 'Bounces and complaints')}>
      <div className="space-y-2 rounded-lg border p-4">
        <p className="text-sm">
          <span className="text-2xl font-semibold tabular-nums">{percentText(limits.rate)}</span>{' '}
          <span className="text-muted-foreground">
            {t('rates-window', 'since {{since}}', { since: fmt.dateTime(limits.windowSince) })}
          </span>
        </p>
        <div className="relative h-2 rounded-full bg-muted" style={positions} aria-hidden>
          <span className={cn('absolute inset-y-0 left-0 w-(--rate) rounded-full', tone)} />
          <span className="absolute -inset-y-1 left-(--advance) w-0.5 bg-foreground/40" />
          <span className="absolute -inset-y-1 left-(--down) w-0.5 bg-foreground/60" />
          <span className="absolute -inset-y-1 left-(--halt) w-0.5 bg-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          {t(
            'rates-lines',
            'Under {{advance}}: goes up a step · {{down}}: goes down a step · {{halt}}: sending halts',
            {
              advance: percentText(limits.advanceBelow),
              down: percentText(limits.stepDownAt),
              halt: percentText(limits.haltAt),
            },
          )}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {t(
            'rates-counts',
            '{{sent}} sent · {{bounced}} bounced · {{complained}} marked as spam',
            {
              sent: fmt.number(limits.windowSent),
              bounced: fmt.number(limits.windowBounced),
              complained: fmt.number(limits.windowComplained),
            },
          )}
          {limits.windowSent < limits.minSample &&
            ` · ${t('rates-few', 'too few to judge yet (under {{count}})', { count: limits.minSample })}`}
        </p>
      </div>
    </OverviewSection>
  );
};

/** Turning the ramp off, for an organisation sending through its own SendGrid or SES. */
const RampToggle = ({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const ramp = useRampToggle();

  return (
    <section className="flex items-start gap-4 rounded-lg border border-destructive/30 p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-medium">{t('ramp', 'Pace and halt sending')}</h3>
        <p className="text-xs text-muted-foreground">
          {t(
            'ramp-off-warning',
            'Your provider may suspend your account if bounces rise; erxes will no longer pace or halt sending.',
          )}
        </p>
      </div>
      <Switch
        aria-label={t('ramp', 'Pace and halt sending')}
        checked={enabled}
        disabled={ramp.pending}
        onCheckedChange={ramp.toggle}
      />
    </section>
  );
};

/** Why the ramp neither paces nor halts now, when it doesn't. */
const OffNote = ({ limits }: { limits: EmailLimits }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });

  if (limits.active) return null;

  return (
    <p className="rounded-lg border p-4 text-sm text-muted-foreground">
      {limits.measured
        ? t('off', 'The ramp is off: erxes counts emails but neither paces nor halts sending.')
        : t(
            'off-smtp',
            'Your SMTP server reports no bounces, so erxes counts emails but neither paces nor halts sending.',
          )}
    </p>
  );
};

const LimitsView = ({ limits }: { limits: EmailLimits }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });

  return (
    <div className="space-y-6">
      <HaltBanner limits={limits} />
      <OffNote limits={limits} />
      <TodayUsage limits={limits} />
      <TierLadder limits={limits} />
      <Rates limits={limits} />
      <p className="text-xs text-muted-foreground">
        {t(
          'auth-cap',
          'Sign-in, invitation and password reset emails are never held. To addresses no delivery proved yet, {{used}} of {{cap}} went out in the last hour; past the cap they are not sent and admins are told.',
          { used: limits.authUnprovenLastHour, cap: limits.authCapPerHour },
        )}
      </p>
      {limits.canTurnOff && limits.measured && <RampToggle enabled={limits.enabled} />}
    </div>
  );
};

/**
 * Organization email's Limits: the daily limit that grows with a clean bounce
 * rate, today's count, the rates against their lines, and the halt.
 */
export const EmailLimitsTab = () => {
  const limits = useEmailLimits();

  return <QueryState query={limits}>{(data) => <LimitsView limits={data} />}</QueryState>;
};
