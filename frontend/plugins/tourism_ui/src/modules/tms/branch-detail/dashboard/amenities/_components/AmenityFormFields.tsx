import { Control, FieldPathByValue } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AmenityCreateFormType } from '../constants/formSchema';
import { AmenityIconPicker } from './AmenityIconPicker';

type AmenityTextFieldPath = FieldPathByValue<
  AmenityCreateFormType,
  string | undefined
>;

interface AmenityNameFieldProps {
  control: Control<AmenityCreateFormType>;
  name?: AmenityTextFieldPath;
  labelSuffix?: string;
}

export const AmenityNameField = ({
  control,
  name = 'name',
  labelSuffix = '',
}: AmenityNameFieldProps) => {
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('name')}<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input
              placeholder={t('amenity-name-placeholder')}
              {...field}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const AmenityIconField = ({
  control,
}: {
  control: Control<AmenityCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name="icon"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('icon')}</Form.Label>
          <Form.Control>
            <AmenityIconPicker
              value={field.value}
              onValueChange={field.onChange}
              className="w-[42px] border bg-background"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
