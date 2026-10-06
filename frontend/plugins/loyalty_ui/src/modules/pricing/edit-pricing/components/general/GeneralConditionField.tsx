import { Checkbox, Form, Label, Spinner } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GeneralFormValues } from '@/pricing/edit-pricing/components/general/types';
import { usePricingConditionGroups } from '@/pricing/hooks/usePricingConditionGroups';

// Each pick becomes a column in the fixed price table: an extra percent off the new price.
export const GeneralConditionField = ({
  control,
}: {
  control: Control<GeneralFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const { conditionGroups, loading } = usePricingConditionGroups();

  return (
    <Form.Field
      control={control}
      name="conditionIds"
      render={({ field }) => {
        const selected = new Set(field.value || []);
        const toggle = (id: string, checked: boolean) => {
          const next = new Set(selected);
          if (checked) next.add(id);
          else next.delete(id);
          field.onChange([...next]);
        };

        return (
          <Form.Item className="min-w-0 md:col-span-12">
            <Form.Label>
              {t('product-conditions', 'Product conditions')}
            </Form.Label>
            <p className="text-xs text-muted-foreground">
              {t(
                'product-conditions-hint',
                'Each condition becomes a column in the fixed price table (Rules): an extra percent off the new price when a line is sold under it.',
              )}
            </p>
            {loading && <Spinner containerClassName="py-2" />}
            {!loading && !conditionGroups.length && (
              <p className="text-sm text-muted-foreground">
                {t(
                  'no-product-conditions',
                  'No product condition groups. Add them in product settings.',
                )}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {conditionGroups.map((group) => (
                <div key={group._id} className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">{group.name}</span>
                  <div className="flex flex-wrap gap-4">
                    {group.conditions.map((condition) => (
                      <Label
                        key={condition._id}
                        className="flex items-center gap-2 font-normal"
                      >
                        <Checkbox
                          checked={selected.has(condition._id)}
                          onCheckedChange={(checked) =>
                            toggle(condition._id, checked === true)
                          }
                        />
                        {condition.name}
                      </Label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Form.Item>
        );
      }}
    />
  );
};
