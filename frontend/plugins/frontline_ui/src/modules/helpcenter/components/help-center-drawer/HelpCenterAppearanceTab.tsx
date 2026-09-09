import { InfoCard } from 'erxes-ui';
import { TFunction } from 'i18next';
import { Control } from 'react-hook-form';
import {
  StyleColorField,
  StyleFontField,
  StyleHtmlField,
  StyleImageField,
} from '@/helpcenter/components/help-center-drawer/HelpCenterStyleFields';
import {
  HELP_CENTER_FORM_COLOR_FIELDS,
  HELP_CENTER_MAIN_COLOR_FIELDS,
  HELP_CENTER_TEXT_COLOR_FIELDS,
} from '@/helpcenter/constants';
import { IHelpCenterConfigInput } from '@/helpcenter/types';
import {
  TopicBackgroundImageField,
  TopicColorField,
} from '@/knowledgebase/components/TopicAppearanceFields';

export function HelpCenterAppearanceTab({
  control,
  t,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
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
            {HELP_CENTER_MAIN_COLOR_FIELDS.map((field) => (
              <StyleColorField
                key={field.name}
                control={control}
                name={field.name}
                label={t(field.key, field.label)}
              />
            ))}
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
            <StyleFontField
              control={control}
              name="styles.headingFont"
              label={t('kb-heading-font', 'Heading font')}
              placeholder={t('kb-select-font', 'Please select a font')}
            />
            {HELP_CENTER_TEXT_COLOR_FIELDS.map((field) => (
              <StyleColorField
                key={field.name}
                control={control}
                name={field.name}
                label={t(field.key, field.label)}
              />
            ))}
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title={t('kb-form-elements-color', 'Form elements color')}>
        <InfoCard.Content>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_CENTER_FORM_COLOR_FIELDS.map((field) => (
              <StyleColorField
                key={field.name}
                control={control}
                name={field.name}
                label={t(field.key, field.label)}
              />
            ))}
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
            <TopicColorField control={control} name="color" t={t} />
            <TopicBackgroundImageField
              control={control}
              name="backgroundImage"
              t={t}
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
