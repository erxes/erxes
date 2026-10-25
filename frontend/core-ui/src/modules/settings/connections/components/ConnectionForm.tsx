import { Form, Input, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ConnectionAppearanceField } from '@/settings/connections/components/ConnectionAppearanceField';
import { ConnectionFieldsInput } from '@/settings/connections/components/ConnectionFieldsInput';
import {
  connectionFormRows,
  TConnectionForm,
} from '@/settings/connections/form';
import { IConnectionType } from '@/settings/connections/types';

type Props = {
  types: IConnectionType[];
  // A saved connection keeps its type: its sealed values belong to it.
  typeLocked: boolean;
};

export const ConnectionForm = ({ types, typeLocked }: Props) => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const form = useFormContext<TConnectionForm>();
  const typeId = form.watch('type');
  const type = types.find((entry) => entry.id === typeId);

  return (
    <div className="flex flex-col gap-4">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name', 'Name')}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder={t('name-placeholder', 'e.g. OpenAI production')} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <ConnectionAppearanceField />

      <Form.Field
        control={form.control}
        name="type"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('type', 'Type')}</Form.Label>
            <Select
              value={field.value}
              disabled={typeLocked}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue(
                  'fields',
                  connectionFormRows(types.find((entry) => entry.id === value)),
                );
              }}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder={t('choose-type', 'Choose a type')} />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {types.map((entry) => (
                  <Select.Item key={entry.id} value={entry.id}>
                    {entry.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {type?.description ? (
              <Form.Description>{type.description}</Form.Description>
            ) : null}
            <Form.Message />
          </Form.Item>
        )}
      />

      <ConnectionFieldsInput allowCustomFields={Boolean(type?.allowCustomFields)} />
    </div>
  );
};
