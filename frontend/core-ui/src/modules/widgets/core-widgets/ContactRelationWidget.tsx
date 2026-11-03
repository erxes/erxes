import { IconBuildingSkyscraper, IconUserSearch } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CompanyWidget,
  CustomerWidget,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  useRelations,
} from 'ui-modules';

type ContactRelationWidgetProps = Pick<
  IRelationWidgetProps,
  'contentType' | 'contentId' | 'access'
> & { relatedContentType: 'core:customer' | 'core:company' };

/** Displays existing reciprocal contact links through the shared relation query. */
export const ContactRelationWidget = ({
  contentType,
  contentId,
  relatedContentType,
  access,
}: ContactRelationWidgetProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });
  const { relatedIds, loading, error, refetch } = useRelations({
    variables: { contentType, contentId, relatedContentType },
    notifyOnNetworkStatusChange: true,
  });
  const isCompany = relatedContentType === 'core:company';
  const icon = isCompany ? IconBuildingSkyscraper : IconUserSearch;

  if (loading) {
    return (
      <div
        role="status"
        aria-label={t('loading-linked-records', 'Loading linked records')}
      >
        <Spinner containerClassName="py-6" />
      </div>
    );
  }
  if (error) {
    return (
      <RelationWidgetEmptyState
        icon={icon}
        message={t('relations-error', 'Unable to load linked records')}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch().catch(() => undefined)}
        >
          {t('retry', 'Try again')}
        </Button>
      </RelationWidgetEmptyState>
    );
  }
  if (!relatedIds.length) {
    return (
      <RelationWidgetEmptyState
        icon={icon}
        message={t(isCompany ? 'no-companies' : 'no-customers')}
      />
    );
  }
  const scope = `contact-relations.${contentType}.${contentId}`;
  return isCompany ? (
    <CompanyWidget companyIds={relatedIds} scope={scope} />
  ) : (
    <CustomerWidget customerIds={relatedIds} scope={scope} access={access} />
  );
};
