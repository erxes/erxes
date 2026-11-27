import { paths } from '~/lib/paths';
import { useFormat } from 'erxes-ui';
import { BANNER_LINK, PageBanner } from '~/components/PageBanner';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { usePlan } from './usePlan';

/**
 * One line above every page when the subscription needs attention: the
 * workspace disabled on erxes.io (red), a plugin read-only after leaving the
 * plan (red), a payment retrying (amber). Nothing otherwise, never self-hosted.
 */
export const PlanBanner = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'plan' });
  const fmt = useFormat();
  const { data } = usePlan();
  const now = useMinuteClock();

  if (!data?.saas) return null;

  const readOnly = data.plugins.filter((plugin) => plugin.access === 'read_only');
  const [firstReadOnly] = readOnly;
  const retrying = data.plugins.filter((plugin) => plugin.status === 'past_due');
  let severe = true;
  let message: string;

  if (data.organizationStatus !== 'active') {
    message = t('banner-disabled', 'This workspace is disabled on erxes.io.');
  } else if (firstReadOnly) {
    message = t(
      'banner-read-only',
      '{{plugins}} left your plan: read-only until {{date}}, then turned off. Buy it again to keep using it.',
      {
        plugins: readOnly.map((plugin) => plugin.title).join(', '),
        date: fmt.date(firstReadOnly.readOnlyUntil ?? new Date(now).toISOString()),
      },
    );
  } else if (retrying.length) {
    severe = false;
    message = t(
      'banner-past-due',
      "The payment for {{plugins}} didn't go through; erxes.io is retrying. Update your card to keep them.",
      {
        plugins: retrying.map((plugin) => plugin.title).join(', '),
      },
    );
  } else {
    return null;
  }

  return (
    <PageBanner severe={severe} message={message}>
      <Link to={paths.settings.plan} className={BANNER_LINK}>
        {t('see-plan', 'See your plan')}
      </Link>
      {data.manageUrl && (
        <a href={data.manageUrl} target="_blank" rel="noreferrer" className={BANNER_LINK}>
          {t('manage', 'Manage on erxes.io')}
        </a>
      )}
    </PageBanner>
  );
};
