import { useTranslation } from 'react-i18next';
import { Button, ColorPicker, Form, Label, Upload } from 'erxes-ui';
import {
  HeroStyleRadioGroup,
  NavigationVariantRadioGroup,
} from '@/integrations/erxes-messenger/components/EMAppearanceOptions';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EMAPPEARANCE_SCHEMA } from '@/integrations/erxes-messenger/constants/emAppearanceSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EMLayout,
  EMLayoutPreviousStepButton,
} from '@/integrations/erxes-messenger/components/EMLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';
import { IconUpload } from '@tabler/icons-react';

export const EMAppearance = () => {
  const { t } = useTranslation('frontline');
  const atomValue = useAtomValue(erxesMessengerSetupAppearanceAtom);
  const setStep = useSetAtom(erxesMessengerSetupStepAtom);
  const form = useForm<z.infer<typeof EMAPPEARANCE_SCHEMA>>({
    resolver: zodResolver(EMAPPEARANCE_SCHEMA),
    defaultValues: atomValue ?? {
      primary: {
        DEFAULT: '#5048e5',
        foreground: '#fff',
      },
      navigationVariant: 'pill',
    },
  });

  const onSubmit = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupAppearanceAtom}
      />
      <form
        className="flex-auto h-full flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EMLayout
          title={t('appearance')}
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">{t('next-step')}</Button>
            </>
          }
        >
          <div className="space-y-6 p-4 pt-0 overflow-y-auto hide-scroll styled-scroll">
            <Label className="text-foreground">{t('brand-colors')}</Label>
            <div className="flex gap-3">
              <Form.Field
                name="primary.DEFAULT"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('brand-color')}</Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        className="w-32"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="primary.foreground"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('text-color')}</Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        className="w-32"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="backgroundColor"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('background-color')}</Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        className="w-32"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-foreground">{t('logos')}</Label>
              <Form.Field
                name="logo"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('logo')}</Form.Label>
                    <Form.Control>
                      <Upload.Root
                        value={field.value || ''}
                        onChange={(fileInfo) => {
                          if (fileInfo && 'url' in fileInfo) {
                            field.onChange(fileInfo.url);
                          } else {
                            field.onChange(fileInfo);
                          }
                        }}
                      >
                        <Upload.Preview className="[&_img]:bg-muted border-dashed border border-border rounded" />
                        <Upload.Button variant={'outline'} size="sm">
                          <IconUpload />
                          {!!field.value ? t('replace') : t('upload')}
                        </Upload.Button>
                        <Upload.RemoveButton
                          size="sm"
                          variant="outline"
                          type="button"
                        />
                      </Upload.Root>
                    </Form.Control>
                    <Form.Message />
                    <Form.Description>
                      {t('logo-description')}
                    </Form.Description>
                  </Form.Item>
                )}
              />
              <Form.Field
                name="launcherLogo"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('launcher-logo')}</Form.Label>
                    <Form.Control>
                      <Upload.Root
                        value={field.value || ''}
                        onChange={(fileInfo) => {
                          if (fileInfo && 'url' in fileInfo) {
                            field.onChange(fileInfo.url);
                          } else {
                            field.onChange(fileInfo);
                          }
                        }}
                      >
                        <Upload.Preview className="[&_img]:bg-muted border-dashed border border-border rounded" />
                        <Upload.Button variant={'outline'} size="sm">
                          <IconUpload />
                          {!!field.value ? t('replace') : t('upload')}
                        </Upload.Button>
                        <Upload.RemoveButton
                          size="sm"
                          variant="outline"
                          type="button"
                        />
                      </Upload.Root>
                    </Form.Control>
                    <Form.Message />
                    <Form.Description>
                      {t('launcher-logo-description')}
                    </Form.Description>
                  </Form.Item>
                )}
              />
            </div>
            <Form.Field
              name="heroStyleVariant"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-foreground">
                    {t('hero-style')}
                  </Form.Label>
                  <Form.Description>
                    {t('hero-style-description')}
                  </Form.Description>
                  <Form.Control>
                    <HeroStyleRadioGroup
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="navigationVariant"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-foreground">
                    {t('navigation-bar')}
                  </Form.Label>
                  <Form.Control>
                    <NavigationVariantRadioGroup
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};
