import { Checkbox, Form, Label, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCampaignEarnRows } from '../../../hooks/useCampaignEarnRows';
import { TAdjustScoreActionConfigForm } from '../../../states/adjustScoreActionConfigFormDefinitions';

export const EarnRowsField = ({
  form,
}: {
  form: UseFormReturn<TAdjustScoreActionConfigForm>;
}) => {
  const { t } = useTranslation('loyalty');
  const { rows, loading } = useCampaignEarnRows(form);

  if (loading) {
    return <Spinner size="sm" />;
  }

  if (!rows.length) {
    return null;
  }

  return (
    <Form.Field
      control={form.control}
      name="earnRowKeys"
      render={({ field }) => {
        const selected = field.value || [];

        return (
          <Form.Item>
            <Form.Label>{t('earn-rows-active')}</Form.Label>
            <div className="flex flex-col gap-2">
              {rows.map(({ key, name, kind }) => (
                <Label
                  key={key}
                  className="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    checked={selected.includes(key)}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked
                          ? [...selected, key]
                          : selected.filter((item) => item !== key),
                      )
                    }
                  />
                  {name}
                  <span className="text-xs text-muted-foreground">
                    {t(`earn-kind-${kind}`)}
                  </span>
                </Label>
              ))}
            </div>
            <Form.Description>{t('earn-rows-active-hint')}</Form.Description>
          </Form.Item>
        );
      }}
    />
  );
};
