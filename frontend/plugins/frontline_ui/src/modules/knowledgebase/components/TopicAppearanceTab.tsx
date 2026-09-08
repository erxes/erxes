import { IconUpload } from '@tabler/icons-react';
import { ColorPicker, Form, InfoCard, Upload } from 'erxes-ui';
import { TFunction } from 'i18next';
import { Control } from 'react-hook-form';
import {
  StyleColorField,
  StyleFontField,
  StyleHtmlField,
  StyleImageField,
} from '@/knowledgebase/components/TopicStyleFields';
import { TopicFormData } from '@/knowledgebase/topicDrawerTypes';

export function TopicAppearanceTab({
  control,
  t,
}: Readonly<{
  control: Control<TopicFormData>;
  t: TFunction;
}>) {
  return (
    <div className="grid gap-4">
      <InfoCard
        title={t('kb-logo-and-favicon', 'Logo and favicon')}
        description={t(
          'kb-logo-and-favicon-description',
          'Shown in the published site header and browser tab.',
        )}
      >
        <InfoCard.Content>
          <div className="grid gap-4 sm:grid-cols-2">
            <StyleImageField
              control={control}
              name="styles.mainLogo"
              label={t('kb-main-logo', 'Main logo')}
              description={t(
                'kb-main-logo-description',
                'Help center main logo PNG.',
              )}
            />
            <StyleImageField
              control={control}
              name="styles.favicon"
              label={t('kb-favicon', 'Favicon')}
              description={t(
                'kb-favicon-description',
                '16x16px transparent PNG.',
              )}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title={t('kb-main-colors', 'Main colors')}>
        <InfoCard.Content>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StyleColorField
              control={control}
              name="styles.bodyColor"
              label={t('kb-body-color', 'Body')}
            />
            <StyleColorField
              control={control}
              name="styles.headerColor"
              label={t('kb-header-color', 'Header')}
            />
            <StyleColorField
              control={control}
              name="styles.footerColor"
              label={t('kb-footer-color', 'Footer')}
            />
            <StyleColorField
              control={control}
              name="styles.helpCenterColor"
              label={t('kb-help-center-color', 'Help center')}
            />
            <StyleColorField
              control={control}
              name="styles.backgroundColor"
              label={t('kb-background-color', 'Background')}
            />
            <StyleColorField
              control={control}
              name="styles.activeTabColor"
              label={t('kb-active-tab-color', 'Active tab')}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title={t('kb-fonts-and-color', 'Fonts and color')}>
        <InfoCard.Content>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StyleFontField
              control={control}
              name="styles.baseFont"
              label={t('kb-base-font', 'Base font')}
              placeholder={t('kb-select-font', 'Please select a font')}
            />
            <StyleColorField
              control={control}
              name="styles.baseColor"
              label={t('kb-base-color', 'Base color')}
            />
            <StyleFontField
              control={control}
              name="styles.headingFont"
              label={t('kb-heading-font', 'Heading font')}
              placeholder={t('kb-select-font', 'Please select a font')}
            />
            <StyleColorField
              control={control}
              name="styles.headingColor"
              label={t('kb-heading-color', 'Heading color')}
            />
            <StyleColorField
              control={control}
              name="styles.linkColor"
              label={t('kb-link-color', 'Link text')}
            />
            <StyleColorField
              control={control}
              name="styles.linkHoverColor"
              label={t('kb-link-hover-color', 'Link hover text')}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title={t('kb-form-elements-color', 'Form elements color')}>
        <InfoCard.Content>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StyleColorField
              control={control}
              name="styles.primaryButtonColor"
              label={t('kb-primary-button-color', 'Primary action button')}
            />
            <StyleColorField
              control={control}
              name="styles.secondaryButtonColor"
              label={t('kb-secondary-button-color', 'Secondary action button')}
            />
            <StyleColorField
              control={control}
              name="styles.dividerColor"
              label={t(
                'kb-divider-color',
                'Heading divider & input focus glow',
              )}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard
        title={t('kb-topic-appearance', 'Topic appearance')}
        description={t(
          'kb-topic-appearance-description',
          "This topic's own accent colour and cover image.",
        )}
      >
        <InfoCard.Content>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Field
              control={control}
              name="color"
              rules={{ required: 'Color is required' }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('kb-color-required')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <ColorPicker
                      className="w-full h-8"
                      value={field.value}
                      onValueChange={(value: string) => field.onChange(value)}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="backgroundImage"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('kb-background-image')}</Form.Label>
                  <Form.Control>
                    <Upload.Root
                      value={field.value}
                      onChange={(fileInfo) => {
                        if ('url' in fileInfo) {
                          field.onChange(fileInfo.url);
                        }
                      }}
                    >
                      <Upload.Preview />
                      <div className="flex flex-col gap-2">
                        <Upload.Button
                          size="sm"
                          variant="outline"
                          type="button"
                        >
                          <IconUpload className="mr-2 w-4 h-4" />
                          {t('kb-upload-image')}
                        </Upload.Button>
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
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard
        title={t('kb-advanced', 'Advanced')}
        description={t(
          'kb-advanced-description',
          'Raw markup injected into the published page.',
        )}
      >
        <InfoCard.Content>
          <StyleHtmlField
            control={control}
            name="styles.headerHtml"
            label={t('kb-header-html', 'Header HTML')}
          />
          <StyleHtmlField
            control={control}
            name="styles.footerHtml"
            label={t('kb-footer-html', 'Footer HTML')}
          />
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
}
