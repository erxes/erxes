import { Form, Input } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { useSpendRulesEditor } from '../hooks/useSpendRulesEditor';

const RULE_FIELDS = [
  {
    name: 'minBalance',
    labelKey: 'spend-min-balance',
    suffixKey: 'earn-points-suffix',
  },
  { name: 'maxShare', labelKey: 'spend-max-share', suffix: '%' },
  { name: 'step', labelKey: 'spend-step', suffixKey: 'earn-points-suffix' },
] as const;

export const SpendRulesEditor = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const { pointValue } = useSpendRulesEditor(form);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {t('spend-rules-hint', {
          value: Number(pointValue).toLocaleString(),
        })}
      </p>
      <div className="grid grid-cols-3 gap-4">
        {RULE_FIELDS.map((rule) => (
          <Form.Field
            key={rule.name}
            control={form.control}
            name={`subtract.rules.${rule.name}`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t(rule.labelKey)}</Form.Label>
                <div className="flex items-center gap-2">
                  <Form.Control>
                    <Input
                      type="number"
                      min={0}
                      placeholder="—"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </Form.Control>
                  <span className="text-xs text-muted-foreground">
                    {'suffix' in rule ? rule.suffix : t(rule.suffixKey)}
                  </span>
                </div>
                <Form.Description>
                  {t(`${rule.labelKey}-hint`)}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        ))}
      </div>
    </div>
  );
};
