import { Form, Input } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TLoyaltyAccountTypeFormValues } from '../hooks/useLoyaltyAccountTypeForm';

// `control` is passed in: the plugin's react-hook-form copy cannot read the
// context erxes-ui's Form provides.
export const LoyaltyAccountTypePointsSection = ({
  control,
  cashbackPercent,
}: {
  control: Control<TLoyaltyAccountTypeFormValues>;
  cashbackPercent?: number;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={control}
          name="currencyRatio"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('loyalty-currency-ratio')}</Form.Label>
              <div className="flex items-center gap-2 text-sm">
                <Form.Control>
                  <Input type="number" min={0} step="any" {...field} />
                </Form.Control>
                <span className="shrink-0">
                  {t('loyalty-currency-ratio-suffix')}
                </span>
              </div>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="pointValue"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('loyalty-point-value')}</Form.Label>
              <div className="flex items-center gap-2 text-sm">
                <span className="shrink-0">
                  {t('loyalty-point-value-prefix')}
                </span>
                <Form.Control>
                  <Input type="number" min={0} step="any" {...field} />
                </Form.Control>
              </div>
              <Form.Message />
            </Form.Item>
          )}
        />
        <p className="text-xs text-muted-foreground">
          {cashbackPercent !== undefined &&
            t('loyalty-cashback-estimate', {
              percent: Number(cashbackPercent.toFixed(3)),
            })}
        </p>
      </div>
      <Form.Field
        control={control}
        name="pendingDays"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('loyalty-pending-days')}</Form.Label>
            <Form.Control>
              <Input type="number" min={0} {...field} />
            </Form.Control>
            <Form.Description>
              {t('loyalty-pending-days-hint')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
