import { IconAlertTriangle, IconLock } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePlan } from './usePlan';

const day = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * One line above every page when the subscription needs attention: the
 * workspace disabled on erxes.io (red), a plugin read-only after leaving the
 * plan (red), a payment retrying (amber). Nothing otherwise, never self-hosted.
 */
export const PlanBanner = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'plan' });
  const { data } = usePlan();

  if (!data?.saas) return null;

  const readOnly = data.plugins.filter((plugin) => plugin.access === 'read_only');
  const retrying = data.plugins.filter((plugin) => plugin.status === 'past_due');
  let severe = true;
  let message: string;

  if (data.organizationStatus !== 'active') {
    message = t('banner-disabled', 'This workspace is disabled on erxes.io.');
  } else if (readOnly.length) {
    message = t('banner-read-only', '{{plugins}} left your plan: read-only until {{date}}, then turned off. Buy it again to keep using it.', {
      plugins: readOnly.map((plugin) => plugin.title).join(', '),
      date: day(readOnly[0]!.readOnlyUntil ?? new Date().toISOString()),
    });
  } else if (retrying.length) {
    severe = false;
    message = t('banner-past-due', "The payment for {{plugins}} didn't go through; erxes.io is retrying. Update your card to keep them.", {
      plugins: retrying.map((plugin) => plugin.title).join(', '),
    });
  } else {
    return null;
  }

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
          {t('manage', 'Manage on erxes.io')}
        </a>
      )}
    </div>
  );
};
