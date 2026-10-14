import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type Config = {
  _id: string;
  name: string;
};

type Props = {
  control: any;
  configs: Config[];
  required?: boolean;
};

export const ConfigSelectField = ({
  control,
  configs,
  required = false,
}: Props) => {
  const { t } = useTranslation('payment');

  return (
    <Form.Field
      name="configId"
      control={control}
      render={({ field }: any) => (
        <Form.Item>
          <Form.Label>
            {t('config')}
            {required ? ' *' : ''}
          </Form.Label>

          <Form.Control>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger>
                <Select.Value placeholder={t('select-config')} />
              </Select.Trigger>

              <Select.Content>
                <Select.Group>
                  {configs.map((config) => (
                    <Select.Item key={config._id} value={config._id}>
                      {config.name}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};