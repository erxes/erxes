import { gql, useQuery } from '@apollo/client';
import {
  Form,
  isEnabled,
  MultipleSelector,
  MultiSelectOption,
  Spinner,
} from 'erxes-ui';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

const EBARIMT_PRODUCT_RULES_QUERY = gql`
  query EbarimtProductRulesForAccounting($kind: String) {
    ebarimtProductRules(kind: $kind) {
      list {
        _id
        title
        kind
      }
    }
  }
`;

type ProductRule = {
  _id: string;
  title?: string;
  kind?: string;
};

const normalizeRuleIds = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const SelectEbarimtProductRules = ({
  value,
  kind,
  onValueChange,
}: {
  value?: string | string[];
  kind: 'vat' | 'ctax';
  onValueChange: (value: string[]) => void;
}) => {
  const mongolianEnabled = isEnabled('mongolian');
  const { data, loading } = useQuery(EBARIMT_PRODUCT_RULES_QUERY, {
    variables: { kind },
    skip: !mongolianEnabled,
  });

  const productRules: ProductRule[] = data?.ebarimtProductRules?.list || [];
  const options: MultiSelectOption[] = productRules.map((rule) => ({
    value: rule._id,
    label: rule.title || rule._id,
  }));
  const selectedRuleIds = normalizeRuleIds(value);
  const selectedOptions: MultiSelectOption[] = selectedRuleIds.map((ruleId) => {
    const rule = productRules.find((productRule) => productRule._id === ruleId);
    return {
      value: ruleId,
      label: rule?.title || ruleId,
    };
  });

  if (!mongolianEnabled) {
    return null;
  }

  return (
    <MultipleSelector
      value={selectedOptions}
      options={options}
      placeholder="Дүрэм сонгох"
      emptyIndicator={
        <p className="text-center text-sm text-muted-foreground">
          Дүрэм олдсонгүй
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
  );
};

export const FormSelectEbarimtProductRule = <T extends FieldValues>({
  name,
  label,
  control,
  kind,
}: {
  name: FieldPath<T>;
  label: string;
  control: Control<T>;
  kind: 'vat' | 'ctax';
}) => {
  if (!isEnabled('mongolian')) {
    return null;
  }

  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <SelectEbarimtProductRules
              value={field.value || []}
              kind={kind}
              onValueChange={field.onChange}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
