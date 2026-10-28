import { Form, Input, PhoneInput, Upload } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  IStructureContactForm,
  STRUCTURE_LINK_NAMES,
} from '../../types/structureEntity';

const toImage = (url: string) =>
  url ? { url, name: url.split('/').pop() || url } : null;

export const StructureContactFields = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control } = useFormContext<IStructureContactForm>();

  return (
    <div className="grid grid-cols-2 gap-3">
      <Form.Field
        control={control}
        name="contact.phoneNumber"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('phone-number')}</Form.Label>
            <Form.Control>
              <PhoneInput
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="contact.email"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('email')}</Form.Label>
            <Form.Control>
              <Input {...field} type="email" placeholder="example@erxes.io" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="contact.image"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{t('image')}</Form.Label>
            <Form.Control>
              <Upload.Root
                value={field.value?.url ?? ''}
                onChange={(file) => {
                  if ('url' in file) {
                    field.onChange(toImage(file.url));
                  }
                }}
              >
                <Upload.Preview />
                <div className="flex items-center gap-2">
                  <Upload.Button size="sm" variant="outline" type="button" />
                  <Upload.RemoveButton
                    size="sm"
                    variant="outline"
                    type="button"
                  />
                </div>
              </Upload.Root>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      {STRUCTURE_LINK_NAMES.map((name) => (
        <Form.Field
          key={name}
          control={control}
          name={`contact.links.${name}`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t(`link-${name}`)}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="https://" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      ))}
    </div>
  );
};
