import {
  CompanyWidget,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
} from 'ui-modules';
import { IconBuildingSkyscraper } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/**
 * The host record's company: the one it keeps itself (`companyId`). Records
 * set it in their own form; no relation is read or written here.
 */
export const CompanyWidgets = ({ companyId }: IRelationWidgetProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });

  if (!companyId) {
    return (
      <RelationWidgetEmptyState
        icon={IconBuildingSkyscraper}
        message={t('no-companies')}
      />
    );
  }

  return <CompanyWidget companyIds={[companyId]} scope=" " />;
};
