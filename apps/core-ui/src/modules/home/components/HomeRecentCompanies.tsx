import { useTranslation } from 'react-i18next';
import { useRecentCompanies } from '../hooks';
import { HOME_NS } from '../i18n';
import { HomeRecordList } from './HomeRecordList';

/** The newest companies. */
export const HomeRecentCompanies = () => {
  const { t, i18n } = useTranslation(HOME_NS);
  const { data, isPending, isError } = useRecentCompanies();

  return (
    <HomeRecordList
      title={t('widgets.recent-companies')}
      viewAllTo="/contacts/companies"
      emptyLabel={t('empty.companies')}
      loading={isPending}
      error={isError}
      rows={(data ?? []).map((company) => ({
        id: company.id,
        name: company.primaryName,
        avatarUrl: company.avatarUrl,
        detail: company.industry || company.website,
        meta: new Date(company.createdAt).toLocaleDateString(i18n.language, {
          month: 'short',
          day: 'numeric',
        }),
        to: `/contacts/companies?companyId=${company.id}`,
      }))}
    />
  );
};
