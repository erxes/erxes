import { toGraphqlView } from '@/utils/graphql';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { Form, Select, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { DEAL_FIELD_GROUPS_WITH_FIELDS } from '../graphql/queries/relatedQueries';
import { SETTINGS_PANEL_SELECT_ITEM_CLASS_NAME } from '@/settings/constants/settingsPanel';

const getFieldLabel = (field: { name?: string | null; code?: string | null }) =>
  field.name || field.code || '-';

export const SyncResponseFieldSelect = ({
  form,
  name = 'responseFieldId',
  label: labelProp,
}: {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
}) => {
  const { t } = useTranslation('accounting');
  const label = labelProp ?? t('sync-response-field');
  const { data: queryData, loading } = useQuery(DEAL_FIELD_GROUPS_WITH_FIELDS, {
    variables: { contentType: 'sales:deal' },
  });
  const data = toGraphqlView(queryData);

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
        <PanelFormRow label={label}>
          <Select
            value={field.value || undefined}
            onValueChange={field.onChange}
            disabled={loading}
          >
            <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
              <Select.Value
                placeholder={loading ? t('loading-label') : t('select-field')}
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
                    key={customField._id}
                    value={customField._id}
                    className={SETTINGS_PANEL_SELECT_ITEM_CLASS_NAME}
                  >
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
        </PanelFormRow>
      )}
    />
  );
};
