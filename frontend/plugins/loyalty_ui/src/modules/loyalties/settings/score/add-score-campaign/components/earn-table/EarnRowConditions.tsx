import {
  Checkbox,
  Form,
  Input,
  Label,
  Popover,
  RecordTableInlineCell,
} from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectCategory, SelectProduct, SelectTags } from 'ui-modules';
import { LoyaltyScoreFormValues } from '../../../constants/formSchema';
import { useEarnRowConditionsSummary } from '../../hooks/useEarnRowConditionsSummary';

const SOURCES = ['sales', 'pos'];

const toArray = (value: string | string[]) =>
  Array.isArray(value) ? value : [value];

export const EarnRowConditions = ({
  form,
  index,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  index: number;
}) => {
  const { t } = useTranslation('loyalty');
  const summary = useEarnRowConditionsSummary(form, index);
  const path = `add.table.rows.${index}.conditions` as const;

  return (
    <Popover>
      <RecordTableInlineCell.Trigger>
        <span className="truncate">{summary}</span>
      </RecordTableInlineCell.Trigger>
      <Popover.Content className="w-96 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Form.Field
            control={form.control}
            name={`${path}.minAmount`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('earn-min-amount')}</Form.Label>
                <Form.Control>
                  <Input type="number" {...field} value={field.value ?? ''} />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name={`${path}.maxAmount`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('earn-max-amount')}</Form.Label>
                <Form.Control>
                  <Input type="number" {...field} value={field.value ?? ''} />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <Form.Field
          control={form.control}
          name={`${path}.firstPurchase`}
          render={({ field }) => (
            <Form.Item className="flex flex-row items-center gap-2">
              <Form.Control>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
              </Form.Control>
              <Form.Label className="mb-0">
                {t('earn-first-purchase-hint')}
              </Form.Label>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`${path}.sources`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('earn-sources')}</Form.Label>
              <div className="flex gap-4">
                {SOURCES.map((source) => {
                  const selected = field.value || [];

                  return (
                    <Label
                      key={source}
                      className="flex items-center gap-2 font-normal"
                    >
                      <Checkbox
                        checked={selected.includes(source)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...selected, source]
                              : selected.filter((item) => item !== source),
                          )
                        }
                      />
                      {t(`earn-source-${source}`)}
                    </Label>
                  );
                })}
              </div>
              <Form.Description>{t('earn-sources-hint')}</Form.Description>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`${path}.productCategoryIds`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('product-category')}</Form.Label>
              <SelectCategory
                mode="multiple"
                value={field.value}
                onValueChange={(value) => field.onChange(toArray(value))}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`${path}.productIds`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('product')}</Form.Label>
              <SelectProduct
                mode="multiple"
                value={field.value}
                onValueChange={(value) => field.onChange(toArray(value))}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`${path}.tagIds`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('tag')}</Form.Label>
              <SelectTags
                mode="multiple"
                value={field.value || []}
                onValueChange={(value) =>
                  field.onChange(Array.isArray(value) ? value : [])
                }
                tagType="tags"
              />
              <Form.Description>{t('earn-products-hint')}</Form.Description>
            </Form.Item>
          )}
        />
      </Popover.Content>
    </Popover>
  );
};
