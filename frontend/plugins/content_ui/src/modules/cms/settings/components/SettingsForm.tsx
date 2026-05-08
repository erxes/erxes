import {
  IconChartBar,
  IconCheck,
  IconPhoto,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Input,
  MultipleSelector,
  Select,
  Switch,
  Textarea,
  ToggleGroup,
} from 'erxes-ui';
import { LANGUAGES } from '../../../../constants';
import {
  ClientPortalOption,
  SettingsFormState,
  UpdateSetting,
} from '../types/settingsTypes';
import { useTranslation } from 'react-i18next';
import { RobotsOption } from './RobotsOption';
import {
  SettingsField as Field,
  SettingsSectionLabel as SectionLabel,
} from './SettingsField';
import { SettingsSection } from './SettingsSection';
import { Uploader } from './Uploader';

export const SettingsForm = ({
  settings,
  clientPortals,
  updateSetting,
}: {
  settings: SettingsFormState;
  clientPortals: ClientPortalOption[];
  updateSetting: UpdateSetting;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'cms-settings' });

  const getLanguageLabel = (language: string) =>
    LANGUAGES.find((option) => option.value === language)?.label || language;

  const selectedLanguageOptions = settings.languages.map((language) => ({
    value: language,
    label: getLanguageLabel(language),
  }));
  const availableDefaultLanguages = LANGUAGES.filter((language) =>
    settings.languages.includes(language.value),
  );

  const handleLanguagesChange = (
    selected: Array<{ value: string; label: string }>,
  ) => {
    const languages = selected.map((language) => language.value);

    updateSetting('languages', languages);

    if (!languages.length) {
      updateSetting('defaultLanguage', '');
      return;
    }

    if (!languages.includes(settings.defaultLanguage)) {
      updateSetting('defaultLanguage', languages[0]);
    }
  };

  const handleAddKeyword = () => {
    updateSetting('metaKeywords', [...settings.metaKeywords, '']);
  };

  const handleKeywordChange = (index: number, value: string) => {
    updateSetting(
      'metaKeywords',
      settings.metaKeywords.map((keyword, keywordIndex) =>
        keywordIndex === index ? value : keyword,
      ),
    );
  };

  const handleRemoveKeyword = (index: number) => {
    updateSetting(
      'metaKeywords',
      settings.metaKeywords.filter((_, keywordIndex) => keywordIndex !== index),
    );
  };

  return (
    <div className="min-w-0 space-y-4 p-4">
      <SettingsSection
        id="general"
        title={t('sections.general')}
        badge={<Badge variant="secondary">{t('badges.base-info')}</Badge>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="websiteName" label={t('fields.website-name')} required>
            <Input
              id="websiteName"
              value={settings.websiteName}
              onChange={(event) =>
                updateSetting('websiteName', event.target.value)
              }
              variant="secondary"
            />
          </Field>

          <Field
            id="clientPortalKind"
            label={t('fields.client-portal-kind')}
          >
            <Select
              value={settings.clientPortalKind}
              onValueChange={(value) =>
                updateSetting('clientPortalKind', value)
              }
            >
              <Select.Trigger id="clientPortalKind" className="bg-muted">
                <Select.Value placeholder={t('placeholders.select-portal')} />
              </Select.Trigger>
              <Select.Content>
                {clientPortals.length ? (
                  clientPortals.map((portal) => (
                    <Select.Item key={portal._id} value={portal._id}>
                      {portal.name || portal._id}
                    </Select.Item>
                  ))
                ) : settings.clientPortalKind ? (
                  <Select.Item value={settings.clientPortalKind}>
                    {settings.clientPortalKind}
                  </Select.Item>
                ) : null}
              </Select.Content>
            </Select>
          </Field>
        </div>

        <Field
          id="shortDescription"
          label={t('fields.short-description')}
          hint={t('hints.short-description')}
          required
        >
          <Textarea
            id="shortDescription"
            value={settings.shortDescription}
            onChange={(event) =>
              updateSetting('shortDescription', event.target.value)
            }
            className="bg-muted"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field id="domain" label={t('fields.domain')}>
            <Input
              id="domain"
              value={settings.domain}
              onChange={(event) => updateSetting('domain', event.target.value)}
              variant="secondary"
            />
          </Field>

          <Field id="publicUrl" label={t('fields.public-url')}>
            <Input
              id="publicUrl"
              value={settings.publicUrl}
              onChange={(event) =>
                updateSetting('publicUrl', event.target.value)
              }
              variant="secondary"
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        id="seo"
        title={t('sections.seo')}
        badge={<Badge variant="success">{t('badges.new')}</Badge>}
      >
        <SectionLabel>{t('section-labels.defaults')}</SectionLabel>

        <Field
          id="metaTitle"
          label={t('fields.default-meta-title')}
          hint={t('hints.default-meta-title')}
        >
          <Input
            id="metaTitle"
            value={settings.metaTitle}
            placeholder={t('placeholders.default-meta-title')}
            onChange={(event) => updateSetting('metaTitle', event.target.value)}
            variant="secondary"
          />
        </Field>

        <Field
          id="metaDescription"
          label={t('fields.default-meta-description')}
          hint={t('hints.default-meta-description')}
        >
          <Textarea
            id="metaDescription"
            value={settings.metaDescription}
            onChange={(event) =>
              updateSetting('metaDescription', event.target.value)
            }
            className="bg-muted"
          />
          <div className="text-right text-xs text-muted-foreground">
            {settings.metaDescription.length}/160
          </div>
        </Field>

        <Field id="defaultOgImage" label={t('fields.default-og-image')}>
          <Uploader
            icon={IconPhoto}
            label={t('uploads.open-graph-image')}
            hint={t('uploads.open-graph-image-hint')}
            value={settings.metaImage}
            onChange={(value) => updateSetting('metaImage', value)}
          />
        </Field>

        <SectionLabel>{t('section-labels.keywords')}</SectionLabel>

        <Field
          label={t('fields.meta-keywords')}
          hint={t('hints.meta-keywords')}
        >
          <div className="space-y-2">
            {settings.metaKeywords.map((keyword, index) => (
              <div key={index} className="flex max-w-sm items-center gap-2">
                <Input
                  aria-label={t('fields.meta-keywords')}
                  value={keyword}
                  onChange={(event) =>
                    handleKeywordChange(index, event.target.value)
                  }
                  variant="secondary"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('actions.remove-keyword', {
                    defaultValue: 'Remove keyword',
                  })}
                  onClick={() => handleRemoveKeyword(index)}
                >
                  <IconX />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="border-dashed"
              onClick={handleAddKeyword}
            >
              {t('actions.add-keyword')}
            </Button>
          </div>
        </Field>

        <SectionLabel>{t('section-labels.robots-indexing')}</SectionLabel>

        <Field
          label={t('fields.search-engine-indexing')}
          hint={t('hints.search-engine-indexing')}
        >
          <div className="grid gap-2 md:grid-cols-2">
            <RobotsOption
              checked={settings.indexing === 'index'}
              title={t('robots.index-site')}
              description={t('robots.index-site-description')}
              onClick={() => updateSetting('indexing', 'index')}
            />
            <RobotsOption
              checked={settings.indexing === 'noindex'}
              title={t('robots.no-index')}
              description={t('robots.no-index-description')}
              onClick={() => updateSetting('indexing', 'noindex')}
            />
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection
        id="analytics"
        title={t('sections.analytics')}
        badge={<Badge variant="success">{t('badges.new')}</Badge>}
      >
        <SectionLabel>{t('section-labels.google-analytics')}</SectionLabel>

        <Field
          id="gaTrackingId"
          label={t('fields.ga-tracking-id')}
          hint={t('hints.ga-tracking-id')}
        >
          <div className="relative">
            <IconChartBar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="gaTrackingId"
              value={settings.gaTrackingId}
              onChange={(event) =>
                updateSetting('gaTrackingId', event.target.value)
              }
              className="pl-9"
              variant="secondary"
            />
          </div>
        </Field>

        {settings.gaTrackingId ? (
          <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 p-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-success text-success-foreground">
              <IconCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-success">
                {t('analytics.google-analytics-configured')}
              </div>
              <div className="truncate font-mono text-xs text-muted-foreground">
                {t('analytics.tracking-id', {
                  trackingId: settings.gaTrackingId,
                })}
              </div>
            </div>
          </div>
        ) : null}

        <SectionLabel>{t('section-labels.other-integrations')}</SectionLabel>

        <Field
          id="googleTagManagerId"
          label={t('fields.google-tag-manager-id')}
          hint={t('hints.google-tag-manager-id')}
        >
          <Input
            id="googleTagManagerId"
            value={settings.googleTagManagerId}
            placeholder={t('placeholders.google-tag-manager-id')}
            onChange={(event) =>
              updateSetting('googleTagManagerId', event.target.value)
            }
            variant="secondary"
          />
        </Field>

        <Field
          id="customHeadScripts"
          label={t('fields.custom-head-scripts')}
          hint={t('hints.custom-head-scripts')}
        >
          <Textarea
            id="customHeadScripts"
            value={settings.customHeadScripts}
            onChange={(event) =>
              updateSetting('customHeadScripts', event.target.value)
            }
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            className="min-h-20 bg-muted font-mono text-xs"
          />
        </Field>
      </SettingsSection>

      <SettingsSection id="content" title={t('sections.content')}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={t('fields.post-url-format')}
            hint={t('hints.post-url-format')}
          >
            <ToggleGroup
              type="single"
              variant="outline"
              value={settings.postUrlField}
              onValueChange={(value) =>
                value && updateSetting('postUrlField', value)
              }
              className="justify-start"
            >
              {['slug', '_id', 'count'].map((value) => (
                <ToggleGroup.Item
                  key={value}
                  value={value}
                  className="h-7 px-3 text-xs"
                >
                  {t(
                    `post-url-fields.${value === '_id' ? 'id' : value}`,
                  )}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </Field>

          <Field
            id="postsPerPage"
            label={t('fields.posts-per-page')}
            hint={t('hints.posts-per-page')}
          >
            <Select
              value={settings.postsPerPage}
              onValueChange={(value) => updateSetting('postsPerPage', value)}
            >
              <Select.Trigger id="postsPerPage" className="bg-muted">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {['10', '20', '50'].map((value) => (
                  <Select.Item key={value} value={value}>
                    {value}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('fields.default-post-status')}>
            <ToggleGroup
              type="single"
              variant="outline"
              value={settings.defaultPostStatus}
              onValueChange={(value) =>
                value && updateSetting('defaultPostStatus', value)
              }
              className="justify-start"
            >
              <ToggleGroup.Item value="draft" className="h-7 px-3 text-xs">
                {t('post-statuses.draft')}
              </ToggleGroup.Item>
              <ToggleGroup.Item value="published" className="h-7 px-3 text-xs">
                {t('post-statuses.published')}
              </ToggleGroup.Item>
            </ToggleGroup>
          </Field>

          <Field label={t('fields.comments')}>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div>
                <div className="text-sm font-medium">
                  {t('comments.allow-comments')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('comments.enable-comment-threads')}
                </div>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(checked) =>
                  updateSetting('allowComments', checked)
                }
              />
            </div>
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection id="languages" title={t('sections.languages')}>
        <Field label={t('fields.supported-languages')}>
          <MultipleSelector
            defaultOptions={LANGUAGES}
            onSearchSync={(term) =>
              LANGUAGES.filter(
                (language) =>
                  language.label.toLowerCase().includes(term.toLowerCase()) ||
                  language.value.toLowerCase().includes(term.toLowerCase()),
              )
            }
            triggerSearchOnFocus
            value={selectedLanguageOptions}
            onChange={handleLanguagesChange}
            placeholder={t('placeholders.select-languages')}
            commandProps={{ shouldFilter: false }}
          />
        </Field>

        <Field
          id="defaultLanguage"
          label={t('fields.default-language')}
          hint={t('hints.default-language')}
        >
          <Select
            value={settings.defaultLanguage}
            onValueChange={(value) => updateSetting('defaultLanguage', value)}
            disabled={availableDefaultLanguages.length === 0}
          >
            <Select.Trigger id="defaultLanguage" className="bg-muted">
              <Select.Value
                placeholder={t('placeholders.select-default-language')}
              />
            </Select.Trigger>
            <Select.Content>
              {availableDefaultLanguages.map((language) => (
                <Select.Item key={language.value} value={language.value}>
                  {language.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Field>
      </SettingsSection>

      <SettingsSection
        id="appearance"
        title={t('sections.appearance')}
        badge={<Badge variant="secondary">{t('badges.optional')}</Badge>}
      >
        <Field label={t('fields.site-logo')}>
          <Uploader
            icon={IconPhoto}
            label={t('uploads.logo-image')}
            hint={t('uploads.logo-image-hint')}
            value={settings.siteLogo}
            onChange={(value) => updateSetting('siteLogo', value)}
          />
        </Field>

        <Field label={t('fields.favicon')}>
          <Uploader
            icon={IconWorld}
            label={t('uploads.favicon')}
            hint={t('uploads.favicon-hint')}
            value={settings.favicon}
            onChange={(value) => updateSetting('favicon', value)}
          />
        </Field>
      </SettingsSection>
    </div>
  );
};
