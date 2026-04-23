import { Control, Controller } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { Label, Input, Checkbox, Select } from 'erxes-ui';
import queries from '@/pos/graphql/queries';
import type { EbarimtConfigFormData } from './EbarimtConfig';

interface VatProps {
  control: Control<EbarimtConfigFormData>;
}

export const Vat: React.FC<VatProps> = ({ control }) => {
  const { data: vatRulesData, loading: vatRulesLoading } = useQuery(
    queries.ebarimtProductRules,
    {
      variables: { kind: 'vat' },
    },
  );

  const vatRulesOptions =
    vatRulesData?.ebarimtProductRules?.list?.length > 0
      ? vatRulesData.ebarimtProductRules.list
      : [];

  const handleToggleRule = (
    val: string,
    currentRules: string[],
    onChange: (value: string[]) => void,
  ) => {
    const newRules = currentRules.includes(val)
      ? currentRules.filter((rule) => rule !== val)
      : [...currentRules, val];
    onChange(newRules);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Controller
        name="hasVat"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>HAS VAT</Label>
            <div className="flex items-center">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          </div>
        )}
      />

      <Controller
        name="vatPercent"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>VAT PERCENT</Label>
            <Input
              type="number"
              {...field}
              value={field.value || ''}
              placeholder="0"
            />
          </div>
        )}
      />

      <Controller
        name="hasVat"
        control={control}
        render={({ field }) =>
          field.value ? (
            <Controller
              name="reverseVatRules"
              control={control}
              render={({ field: rulesField }) => (
                <div className="space-y-2">
                  <Label>ANOTHER RULES OF PRODUCTS ON VAT</Label>
                  <Select
                    value=""
                    onValueChange={(val) =>
                      handleToggleRule(
                        val,
                        rulesField.value || [],
                        rulesField.onChange,
                      )
                    }
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value
                        placeholder={
                          rulesField.value?.length
                            ? `${rulesField.value.length} selected`
                            : 'Select rule(s)'
                        }
                      />
                    </Select.Trigger>

                    <Select.Content>
                      {vatRulesLoading ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        vatRulesOptions.map(
                          (rule: { _id: string; title: string }) => (
                            <Select.Item
                              key={rule._id}
                              value={rule._id}
                              className={
                                rulesField.value?.includes(rule._id)
                                  ? 'bg-muted font-medium'
                                  : undefined
                              }
                            >
                              {rule.title}
                            </Select.Item>
                          ),
                        )
                      )}
                    </Select.Content>
                  </Select>
                </div>
              )}
            />
          ) : (
            <div />
          )
        }
      />
    </div>
  );
};
