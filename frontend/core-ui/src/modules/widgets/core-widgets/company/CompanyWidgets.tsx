import { Button, Spinner } from 'erxes-ui';
import {
  CompanyWidget,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  SelectCompaniesBulk,
  useContactRelations,
  useManageRelations,
  useRelations,
} from 'ui-modules';
import { IconBuildingSkyscraper, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const CompanyWidgets = ({
  contentId,
  contentType,
  companyId,
  customerIds,
  access,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });
  const { manageRelations } = useManageRelations();
  const { relatedIds, loading } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'core:company',
    },
    skip: !!companyId,
  });

  // A company is reached through a customer, never through another company.
  const contactCompanies = useContactRelations({
    contentType,
    contentId,
    relatedContentType: 'core:company',
    customerIds,
    excludeIds: companyId ? [companyId] : relatedIds,
  });

  const canWrite = access === 'write';

  const handleSelectCompanies = (companyIds: string[]) => {
    manageRelations({
      contentType,
      contentId,
      relatedContentType: 'core:company',
      relatedContentIds: companyIds,
    });
  };

  if (loading || contactCompanies.loading) {
    return <Spinner className="size-4" />;
  }

  const companyIds = companyId ? [companyId] : relatedIds;

  if (!companyIds.length && !contactCompanies.relatedIds.length) {
    return (
      <RelationWidgetEmptyState
        icon={IconBuildingSkyscraper}
        message={t('no-companies')}
      >
        {canWrite && (
          <SelectCompaniesBulk onSelect={handleSelectCompanies}>
            <Button variant="outline" size="sm">
              <IconPlus className="mr-2 h-4 w-4" />
              {t('add-company')}
            </Button>
          </SelectCompaniesBulk>
        )}
      </RelationWidgetEmptyState>
    );
  }

  return (
    <CompanyWidget
      companyIds={companyIds}
      contactCompanyIds={contactCompanies.relatedIds}
      scope=" "
      onManageCompanies={canWrite ? handleSelectCompanies : undefined}
    />
  );
};
