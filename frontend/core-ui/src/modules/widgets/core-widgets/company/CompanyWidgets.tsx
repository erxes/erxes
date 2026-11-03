import { ContactRelationWidget } from '../ContactRelationWidget';
import {
  CompanyWidget,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
} from 'ui-modules';
import { IconBuildingSkyscraper } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** Shows reciprocal company links for contacts and explicit host fields for other records. */
export const CompanyWidgets = (props: IRelationWidgetProps) => {
  const { companyId } = props;
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });

  if (props.contentType === 'core:customer') {
    return (
      <ContactRelationWidget {...props} relatedContentType="core:company" />
    );
  }

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
