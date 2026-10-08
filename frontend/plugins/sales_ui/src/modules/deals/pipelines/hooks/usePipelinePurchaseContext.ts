import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { IRelationSettingsWidgetContext } from 'ui-modules';

// Registered types name the collection (`deals`).
export const DEAL_WON_TRIGGER_TYPE = 'sales:sales.deals.probability';

// What other plugins' pipeline settings tabs get: a deal reaching Won, in
// this pipeline or any, and how it names the buyer.
export const usePipelinePurchaseContext = (
  pipelineId: string,
  pipelineName: string,
): IRelationSettingsWidgetContext => {
  const { t } = useTranslation('sales');
  const { pathname, search } = useLocation();
  const label = pipelineName || t('pipeline', 'Pipeline');

  return {
    triggerType: DEAL_WON_TRIGGER_TYPE,
    buyerAttribution: '{{ trigger.customers }}',
    scopes: [
      {
        key: 'own',
        label,
        triggerConfig: { probability: 'Won', pipelineId },
      },
      {
        key: 'all',
        label: t('pipeline-automation-all', 'All pipelines'),
        triggerConfig: { probability: 'Won' },
      },
    ],
    label,
    returnTo: { path: `${pathname}${search}`, label },
  };
};
