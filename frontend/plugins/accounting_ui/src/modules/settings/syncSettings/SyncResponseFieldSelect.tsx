import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { Form, Select, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { DEAL_FIELD_GROUPS_WITH_FIELDS } from '../graphql/queries/relatedQueries';

const getFieldLabel = (field: any) => field.name || field.code || field._id;

export const SyncResponseFieldSelect = ({
  form,
  name = 'responseFieldId',
  label,
}: {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
}) => {
  const { t } = useTranslation('accounting');

  const { data, loading } = useQuery(DEAL_FIELD_GROUPS_WITH_FIELDS, {
    variables: { contentType: 'sales:deal' },
  });

  const groupNameById = new Map(
    (data?.fieldGroups?.list || []).map((group: any) => [
      group._id,
      group.name,
    ]),
  );
  const fields = data?.fields?.list || [];

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {label ?? t('synchronization-response-field')}
          </Form.Label>
          <Form.Control>
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={loading}
            >
              <Select.Trigger>
                <Select.Value
                  placeholder={loading ? t('loading') : t('select-a-field')}
                />
              </Select.Trigger>
              <Select.Content>
                {loading ? (
                  <div className="p-2">
                    <Spinner />
                  </div>
                ) : (
                  fields.map((customField: any) => (
                    <Select.Item key={customField._id} value={customField._id}>
                      {[
                        groupNameById.get(customField.groupId),
                        getFieldLabel(customField),
                      ]
                        .filter(Boolean)
                        .join(' / ')}
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
