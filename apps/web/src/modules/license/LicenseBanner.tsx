import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BANNER_LINK, PageBanner } from '~/components/PageBanner';
import { paths } from '~/lib/paths';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { DAY, ENDING_SOON_DAYS, useLicense } from './useLicense';

/**
 * Self-hosted: one line above every page when the erxes license needs attention: plugins it
 * doesn't cover (red), plugins read-only after it ended (red), its last day near (amber). Nothing
 * otherwise, and never on erxes.io, where the plan decides.
 */
export const LicenseBanner = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'license' });
  const fmt = useFormat();
  const { data } = useLicense();
  const now = useMinuteClock();

  if (!data || data.saas || !data.plugins.length) return null;

  const named = (access: string) =>
    data.plugins
      .filter((plugin) => plugin.access === access)
      .map((plugin) => plugin.title)
      .join(', ');

  const off = named('off');
  const readOnly = named('read_only');
  const until = data.license ? Date.parse(data.license.until) : null;
  let severe = true;
  let message: string;

  if (off) {
    message = t('banner-off', '{{plugins}} need an erxes license for this server.', {
      plugins: off,
    });
  } else if (readOnly && until !== null && data.license) {
    message = t(
      'banner-read-only',
      'The erxes license has ended: {{plugins}} only read until {{date}}, then stop.',
      {
        plugins: readOnly,
        date: fmt.date(new Date(until + data.license.graceDays * DAY).toISOString()),
      },
    );
  } else if (until !== null && until - now <= ENDING_SOON_DAYS * DAY) {
    severe = false;
    message = t(
      'banner-ending',
      'The erxes license ends on {{date}}: renew it to keep {{plugins}}.',
      {
        date: fmt.date(new Date(until).toISOString()),
        plugins: data.plugins.map((plugin) => plugin.title).join(', '),
      },
    );
  } else {
    return null;
  }

  return (
    <PageBanner severe={severe} message={message}>
      <Link to={paths.settings.license} className={BANNER_LINK}>
        {t('see-license', 'See the license')}
      </Link>
    </PageBanner>
  );
};
