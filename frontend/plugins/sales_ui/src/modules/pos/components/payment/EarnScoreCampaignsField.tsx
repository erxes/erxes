import { IconX } from '@tabler/icons-react';
import { Badge, Button, Form } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RecordPickerWidget } from 'ui-modules';
import { SCORE_CAMPAIGN_CONTENT_TYPE } from '@/deals/loyaltyRules/constants';
import { useScoreCampaignTitles } from '@/deals/loyaltyRules/hooks/useScoreCampaignTitles';
import { usePosEarnAutomations } from '@/pos/hooks/usePosEarnAutomations';
import type { PaymentFormData } from './Payment';

// The one score campaign a paid order of this POS earns in; a returned order
// gives everything back.
export const EarnScoreCampaignsField = ({
  control,
  posId,
}: {
  control: Control<PaymentFormData>;
  posId?: string;
}) => {
  const { t } = useTranslation('sales');
  const { inactive } = useScoreCampaignTitles();
  const { automationNamesFor } = usePosEarnAutomations(posId);

  return (
    <Form.Field
      control={control}
      name="earnScoreCampaignId"
      render={({ field }) => {
        const campaignId: string = field.value || '';

        return (
          <Form.Item>
            <Form.Label>{t('pos-earn-campaigns')}</Form.Label>
            <p className="text-xs text-muted-foreground">
              {t('pos-earn-campaigns-hint')}
            </p>
            <div className="flex max-w-md items-center gap-1">
              <div className="min-w-0 flex-1">
                <RecordPickerWidget
                  contentType={SCORE_CAMPAIGN_CONTENT_TYPE}
                  value={campaignId}
                  onValueChange={field.onChange}
                  placeholder={t('pos-earn-campaigns-add')}
                />
              </div>
              {campaignId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => field.onChange('')}
                  aria-label={t('remove')}
                >
                  <IconX />
                </Button>
              )}
            </div>
            {campaignId && inactive(campaignId) && (
              <Badge variant="warning" className="self-start">
                {t('loyalty-rules-campaign-inactive')}
              </Badge>
            )}
            {campaignId && automationNamesFor(campaignId).length > 0 && (
              <Badge variant="warning" className="self-start">
                {t('pos-earn-campaigns-automation', {
                  names: automationNamesFor(campaignId).join(', '),
                })}
              </Badge>
            )}
          </Form.Item>
        );
      }}
    />
  );
};
