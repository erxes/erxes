import { useQuery } from '@apollo/client';
import { Form, Select, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { FIELDS_COMBINED_BY_CONTENT_TYPE } from '../graphql/queries/relatedQueries';

const getFieldLabel = (field: any) =>
  field.label || field.text || field.code || field.name || field.fieldId;

export const SyncResponseFieldSelect = ({
  form,
  name = 'responseFieldId',
  label = 'Sync хариу бичих талбар',
}: {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
}) => {
  const { data, loading } = useQuery(FIELDS_COMBINED_BY_CONTENT_TYPE, {
    variables: { contentType: 'sales:deal' },
  });

  const fields = (data?.fieldsCombinedByContentType || []).filter(
    (field: any) => field?.fieldId,
  );

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={loading}
            >
              <Select.Trigger>
                <Select.Value
                  placeholder={loading ? 'Уншиж байна' : 'Талбар сонгох'}
                />
              </Select.Trigger>
              <Select.Content>
                {loading ? (
                  <div className="p-2">
                    <Spinner />
                  </div>
                ) : (
                  fields.map((customField: any) => (
                    <Select.Item
                      key={customField.fieldId}
                      value={customField.fieldId}
                    >
                      {getFieldLabel(customField)}
                    </Select.Item>
                  ))
                )}
              </Select.Content>
            </Select>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};
