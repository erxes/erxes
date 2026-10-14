import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { usePipelineLoyaltyBuiltIn } from '@/deals/loyaltyRules/hooks/usePipelineLoyaltyBuiltIn';
import {
  IRelationSettingsPurchaseHistory,
  IRelationSettingsWidgetContext,
  TSegmentFieldNode,
} from 'ui-modules';

// Registered types name the collection (`deals`).
export const DEAL_WON_TRIGGER_TYPE = 'sales:sales.deals.probability';

const DEAL_SEGMENT_TYPE = 'sales:sales.deals';

const dealCondition = (fieldKey: string, value: string): TSegmentFieldNode => ({
  kind: 'field',
  contentType: DEAL_SEGMENT_TYPE,
  fieldKey,
  operator: 'e',
  value,
});

// A customer's Won deals, read where the Won trigger reads them.
const wonDealsHistory = (
  pipelineId?: string,
): IRelationSettingsPurchaseHistory => ({
  subjectType: 'core:contacts.customers',
  relationKey: 'customer.deals',
  relatedType: DEAL_SEGMENT_TYPE,
  amountField: 'totalAmount',
  dateField: 'stageChangedDate',
  conditions: [
    dealCondition('stageProbability', 'Won'),
    ...(pipelineId ? [dealCondition('pipelineId', pipelineId)] : []),
  ],
});

// What other plugins' pipeline settings tabs get: a deal reaching Won, in
// this pipeline or any, and how it names the buyer.
export const usePipelinePurchaseContext = (
  pipelineId: string,
  pipelineName: string,
): IRelationSettingsWidgetContext => {
  const { t } = useTranslation('sales');
  const { pathname, search } = useLocation();
  const label = pipelineName || t('pipeline', 'Pipeline');
  const config = usePipelineLoyaltyBuiltIn(pipelineId);

  return {
    triggerType: DEAL_WON_TRIGGER_TYPE,
    buyerAttribution: '{{ trigger.customers }}',
    scopes: [
      {
        key: 'own',
        label,
        triggerConfig: { probability: 'Won', pipelineId },
        history: wonDealsHistory(pipelineId),
      },
      {
        key: 'all',
        label: t('pipeline-automation-all', 'All pipelines'),
        triggerConfig: { probability: 'Won' },
        history: wonDealsHistory(),
      },
    ],
    label,
    returnTo: { path: `${pathname}${search}`, label },
    config,
  };
};
