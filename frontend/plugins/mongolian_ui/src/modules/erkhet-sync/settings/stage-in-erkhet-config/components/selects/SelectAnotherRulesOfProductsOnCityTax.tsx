import { useTranslation } from 'react-i18next';
import { Form, MultipleSelector, MultiSelectOption, Spinner } from 'erxes-ui';
import { useGetAnotherRulesOfProductsOnCityTax } from '../../hooks/useGetAnotherRulesOfProductsOnCityTax';
import { IAnotherRulesOfProductsOnCityTax } from '../../types/anotherRulesOfProductsOnCityTax';

const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

export const SelectAnotherRulesOfProductsOnCityTax = ({
  value,
  onValueChange,
  kind = 'vat',
}: {
  value?: string | string[];
  onValueChange: (value: string[]) => void;
  kind?: 'vat' | 'ctax';
}) => {
  const { t } = useTranslation('mongolian');
  const { anotherRulesOfProductsOnCityTax, loading } =
    useGetAnotherRulesOfProductsOnCityTax(
      {
        skip: false,
        variables: {
          perPage: 20,
          page: 1,
        },
      },
      kind,
    );

  const options: MultiSelectOption[] = anotherRulesOfProductsOnCityTax?.map(
    (rule: IAnotherRulesOfProductsOnCityTax) => ({
      value: rule._id,
      label: rule.title,
    }),
  );
  const selectedRuleIds = normalizeRuleIds(value);
  const selectedOptions: MultiSelectOption[] = selectedRuleIds.map((ruleId) => {
    const rule = anotherRulesOfProductsOnCityTax?.find(
      (rule: IAnotherRulesOfProductsOnCityTax) => rule._id === ruleId,
    );
    return {
      value: ruleId,
      label: rule?.title || ruleId,
    };
  });

  return (
    <Form.Control>
      <MultipleSelector
        value={selectedOptions}
        options={options}
        placeholder={t('select-product-rules')}
        emptyIndicator={
          <p className="text-center text-sm text-muted-foreground">
            {t('no-rules-found')}
          </p>
        }
        loadingIndicator={
          <div className="flex h-16 items-center justify-center">
            <Spinner />
          </div>
        }
        disabled={loading}
        hidePlaceholderWhenSelected
        onChange={(selectedOptions) =>
          onValueChange(selectedOptions.map((option) => option.value))
        }
      />
    </Form.Control>
  );
};
