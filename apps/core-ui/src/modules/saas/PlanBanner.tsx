import { IconAlertTriangle, IconLock } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePlan } from './usePlan';

const day = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * One line above every page when the subscription needs attention: payment
 * late or in grace (amber), read-only (red), suspended (red). Nothing when
 * all is well, and never on self-hosted.
 */
export const PlanBanner = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'plan' });
  const { data } = usePlan();

  if (!data?.saas || data.standing === 'ok') return null;

  const severe = data.standing !== 'warning';
  const message =
    data.standing === 'suspended'
      ? t('banner-suspended', 'This organisation is suspended: {{reason}}', { reason: data.suspendedReason ?? t('contact-erxes', 'contact erxes') })
      : data.standing === 'read_only'
        ? t('banner-read-only', 'Your subscription has ended. You can still see and export everything; renew to make changes.')
        : data.readOnlyAt
          ? t('banner-warning', 'Your subscription needs attention: changes stop working on {{date}}.', { date: day(data.readOnlyAt) })
          : t('banner-warning-plain', 'Your subscription needs attention.');

  return (
    <div
      role="status"
      className={cn(
        'flex shrink-0 items-center gap-2 px-4 py-1.5 text-sm',
        severe ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning-foreground dark:text-warning',
      )}
    >
      {severe ? <IconLock className="size-4 shrink-0" /> : <IconAlertTriangle className="size-4 shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{message}</span>
      <Link to="/settings/plan" className="shrink-0 font-medium underline underline-offset-2">
        {t('see-plan', 'See your plan')}
      </Link>
      {data.manageUrl && (
        <a href={data.manageUrl} target="_blank" rel="noreferrer" className="shrink-0 font-medium underline underline-offset-2">
          {t('manage', 'Manage subscription')}
        </a>
      )}
    </div>
  );
};
