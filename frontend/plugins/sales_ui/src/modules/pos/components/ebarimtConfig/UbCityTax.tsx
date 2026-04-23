import { Control, Controller } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { Label, Input, Checkbox, Select } from 'erxes-ui';
import queries from '@/pos/graphql/queries';
import type { EbarimtConfigFormData } from './EbarimtConfig';

interface UbCityTaxProps {
  control: Control<EbarimtConfigFormData>;
}

export const UbCityTax: React.FC<UbCityTaxProps> = ({ control }) => {
  const { data: ctaxRulesData, loading: ctaxRulesLoading } = useQuery(
    queries.ebarimtProductRules,
    {
      variables: { kind: 'ctax' },
    },
  );

  const ctaxRulesOptions =
    ctaxRulesData?.ebarimtProductRules?.list?.length > 0
      ? ctaxRulesData.ebarimtProductRules.list
      : [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Controller
        name="hasCitytax"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>HAS UB CITY TAX</Label>
            <div className="flex items-center">
              <Checkbox
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          </div>
        )}
      />

      <Controller
        name="cityTaxPercent"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>UB CITY TAX PERCENT</Label>
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
        name="hasCitytax"
        control={control}
        render={({ field: hasCitytaxField }) =>
          hasCitytaxField.value ? (
            <Controller
              name="reverseCtaxRules"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>ANOTHER RULES OF PRODUCTS ON CITY TAX</Label>
                  <Select
                    value={field.value?.[0] || ''}
                    onValueChange={(val) => field.onChange([val])}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Select rule" />
                    </Select.Trigger>
                    <Select.Content>
                      {ctaxRulesLoading ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        ctaxRulesOptions.map(
                          (rule: { _id: string; title: string }) => (
                            <Select.Item key={rule._id} value={rule._id}>
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
