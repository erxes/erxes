import { formSetupGeneralAtom } from '../states/formSetupStates';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FORM_GENERAL_SCHEMA } from '../constants/formSchema';
import { FormMutateLayout } from './FormMutateLayout';
import { ColorPicker, Form, Input, Textarea, ToggleGroup } from 'erxes-ui';
import { FormValueEffectComponent } from './FormValueEffectComponent';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

export const FormGeneral = () => {
  const { t } = useTranslation('frontline');
  const { id } = useParams<{ id: string }>();
  const form = useForm<z.infer<typeof FORM_GENERAL_SCHEMA>>({
    resolver: zodResolver(FORM_GENERAL_SCHEMA),
    defaultValues: {
      primaryColor: '',
      appearance: 'iframe',
      loadType: 'embedded',
      title: 'title',
      description: '',
      channelId: id ?? '',
      buttonText: 'Submit',
    },
  });

  const onSubmit = (_values: z.infer<typeof FORM_GENERAL_SCHEMA>) => null;

  return (
    <FormMutateLayout
      title={t('general-label')}
      description={t('general-settings')}
      form={form}
      onSubmit={onSubmit}
    >
      <FormValueEffectComponent form={form} atom={formSetupGeneralAtom} />
      <div className="px-5 space-y-5">
        <Form.Field
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title-label')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('description')}</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="primaryColor"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('primary-color')}</Form.Label>
              <div className="w-24">
                <Form.Control>
                  <ColorPicker
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                </Form.Control>
              </div>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="appearance"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('appearance')}</Form.Label>
              <Form.Control>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={field.onChange}
                  variant="outline"
                  className="max-w-96"
                >
                  <ToggleGroup.Item value="iframe" className="flex-auto">
                    {t('iframe')}
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="messenger" className="flex-auto">
                    {t('messenger')}
                  </ToggleGroup.Item>
                </ToggleGroup>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="loadType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('load-type')}</Form.Label>
              <Form.Control>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={field.onChange}
                  variant="outline"
                  className="max-w-96"
                >
                  <ToggleGroup.Item value="embedded" className="flex-auto">
                    {t('embedded')}
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="popup" className="flex-auto">
                    {t('popup')}
                  </ToggleGroup.Item>
                </ToggleGroup>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="buttonText"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('button-text')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="channelId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('channel-label')}</Form.Label>
              <SelectChannel.FormItem
                value={field.value}
                mode="single"
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </FormMutateLayout>
  );
};
