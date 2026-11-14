import { paths } from '~/lib/paths';
import { panelHref } from '~/modules/side-panel/panelNavigation';
import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRecentCompanies } from '../hooks';
import { HOME_NS } from '../i18n';
import { HomeRecordList } from './HomeRecordList';

/** The newest companies. */
export const HomeRecentCompanies = () => {
  const { t } = useTranslation(HOME_NS);
  const fmt = useFormat();
  const { data, isPending, isError } = useRecentCompanies();

  return (
    <HomeRecordList
      title={t('widgets.recent-companies')}
      viewAllTo={paths.contacts.companies}
      emptyLabel={t('empty.companies')}
      loading={isPending}
      error={isError}
      rows={(data ?? []).map((company) => ({
        id: company.id,
        name: company.primaryName,
        avatarUrl: company.avatarUrl,
        detail: company.industry || company.website,
        meta: fmt.date(company.createdAt, 'MMM d'),
        to: panelHref(paths.contacts.companies, {
          contentType: 'core:company',
          contentId: company.id,
        }),
      }))}
    />
  );
};
