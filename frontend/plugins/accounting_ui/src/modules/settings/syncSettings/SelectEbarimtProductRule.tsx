import { gql, useQuery } from '@apollo/client';
import { Form, Select, Spinner } from 'erxes-ui';
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

const EMPTY_VALUE = '__empty__';

type ProductRule = {
  _id: string;
  title?: string;
  kind?: string;
};

const SelectEbarimtProductRule = ({
  value,
  kind,
  onValueChange,
}: {
  value?: string;
  kind: 'vat' | 'ctax';
  onValueChange: (value: string) => void;
}) => {
  const { data, loading } = useQuery(EBARIMT_PRODUCT_RULES_QUERY, {
    variables: { kind },
  });

  const productRules: ProductRule[] = data?.ebarimtProductRules?.list || [];

  return (
    <Select
      value={value || EMPTY_VALUE}
      onValueChange={(ruleId) =>
        onValueChange(ruleId === EMPTY_VALUE ? '' : ruleId)
      }
    >
      <Select.Trigger>
        <Select.Value placeholder="Дүрэм сонгох" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={EMPTY_VALUE}>Дүрэм сонгоогүй</Select.Item>
        {loading ? (
          <div className="flex h-16 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          productRules.map((rule) => (
            <Select.Item key={rule._id} value={rule._id}>
              {rule.title || rule._id}
            </Select.Item>
          ))
        )}
      </Select.Content>
    </Select>
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
  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <SelectEbarimtProductRule
              value={field.value || ''}
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
