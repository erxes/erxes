import {
  IconAlertTriangle,
  IconChartBar,
  IconCheck,
  IconLink,
  IconLock,
  IconPhoto,
  IconTrash,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { SelectMember } from 'ui-modules';
import {
  Badge,
  Button,
  Dialog,
  Input,
  type MultiSelectOption,
  MultipleSelector,
  Select,
  Textarea,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../../../constants';
import {
  CmsSettingsData,
  ClientPortalOption,
  SettingsFormState,
  UpdateSetting,
} from '../types/settingsTypes';
import { RobotsOption } from './RobotsOption';
import {
  SettingsField as Field,
  SettingsSectionLabel as SectionLabel,
} from './SettingsField';
import { SettingsSection } from './SettingsSection';
import { Uploader } from './Uploader';
import { buildPostPublicUrl } from '../../shared/utils';

const POST_URL_FIELD_OPTIONS = [
  { value: '_id', label: 'Post ID' },
  { value: 'count', label: 'Post Count' },
  { value: 'slug', label: 'Post Slug' },
];

const PREVIEW_POST = {
  _id: 'fSY5zj2QmcnXUNSnF9sYo',
  count: 1,
  slug: 'my-first-post',
};

const DELETE_CONFIRMATION_PHRASE = 'delete my project';
const DELETE_NAME_CONFIRMATION_INPUT_ID = 'delete-name-confirmation';
const DELETE_PHRASE_CONFIRMATION_INPUT_ID = 'delete-phrase-confirmation';

interface ISettingsFormProps {
  cms?: CmsSettingsData;
  isDeleting: boolean;
  settings: SettingsFormState;
  clientPortals: ClientPortalOption[];
  updateSetting: UpdateSetting;
  onDelete: () => Promise<void> | void;
}

export const SettingsForm = ({
  cms,
  isDeleting,
  settings,
  clientPortals,
  updateSetting,
  onDelete,
}: ISettingsFormProps) => {
  const { t } = useTranslation('content');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteNameConfirmation, setDeleteNameConfirmation] = useState('');
  const [deletePhraseConfirmation, setDeletePhraseConfirmation] = useState('');

  const getLanguageLabel = (language: string) =>
    LANGUAGES.find((option) => option.value === language)?.label || language;

  const cmsName =
    cms?.name?.trim() || settings.websiteName.trim() || 'this CMS';
  const selectedPostUrlField =
    POST_URL_FIELD_OPTIONS.find(
      (option) => option.value === settings.postUrlField,
    ) || POST_URL_FIELD_OPTIONS[0];
  const previewUrl = buildPostPublicUrl(
    {
      domain: settings.domain,
      publicUrl: settings.publicUrl,
      postUrlField: selectedPostUrlField.value,
      postUrlPrefix: settings.postUrlPrefix,
    },
    PREVIEW_POST,
    { allowRelative: true },
  );
  const canDeleteCMS =
    Boolean(cms?._id) &&
    deleteNameConfirmation.trim() === cmsName &&
    deletePhraseConfirmation.trim() === DELETE_CONFIRMATION_PHRASE &&
    !isDeleting;

  const selectedLanguageOptions = settings.languages.map((language) => ({
    value: language,
    label: getLanguageLabel(language),
  }));
  const availableDefaultLanguages = LANGUAGES.filter((language) =>
    settings.languages.includes(language.value),
  );
  const selectedKeywordOptions = settings.metaKeywords.reduce<
    MultiSelectOption[]
  >((options, keyword) => {
    const value = keyword.trim();

    if (value && !options.some((option) => option.value === value)) {
      options.push({ value, label: value });
    }

    return options;
  }, []);

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

  const handleKeywordChange = (selected: MultiSelectOption[]) => {
    const keywords = selected.reduce<string[]>((acc, keyword) => {
      const value = keyword.value.trim();

      if (value && !acc.includes(value)) {
        acc.push(value);
      }

      return acc;
    }, []);

    updateSetting('metaKeywords', keywords);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);

    if (!open) {
      setDeleteNameConfirmation('');
      setDeletePhraseConfirmation('');
    }
  };

  const handleDelete = async () => {
    if (!canDeleteCMS) {
      return;
    }

    await onDelete();
  };

  return (
    <div className="min-w-0 space-y-4 p-4">
      <SettingsSection
        id="general"
        title={t('general')}
        badge={<Badge variant="secondary">{t('base-info')}</Badge>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="websiteName" label={t('website-name')} required>
            <Input
              id="websiteName"
              value={settings.websiteName}
              onChange={(event) =>
                updateSetting('websiteName', event.target.value)
              }
              variant="secondary"
            />
          </Field>

          <Field id="clientPortalKind" label={t('client-portal-kind')}>
            <Select
              value={settings.clientPortalKind}
              onValueChange={(value) =>
                updateSetting('clientPortalKind', value)
              }
            >
              <Select.Trigger id="clientPortalKind" className="bg-muted">
                <Select.Value placeholder={t('select-portal')} />
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
          label={t('short-description')}
          hint={t('short-description-hint')}
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
          <Field id="domain" label={t('domain')}>
            <Input
              id="domain"
              value={settings.domain}
              onChange={(event) => updateSetting('domain', event.target.value)}
              variant="secondary"
            />
          </Field>

          <Field id="publicUrl" label={t('public-url')}>
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
        title={t('seo')}
        badge={<Badge variant="success">{t('new')}</Badge>}
      >
        <SectionLabel>{t('defaults')}</SectionLabel>

        <Field
          id="metaTitle"
          label={t('default-meta-title')}
          hint={t('default-meta-title-hint')}
        >
          <Input
            id="metaTitle"
            value={settings.metaTitle}
            placeholder="e.g. My Site - {page title}"
            onChange={(event) => updateSetting('metaTitle', event.target.value)}
            variant="secondary"
          />
        </Field>

        <Field
          id="metaDescription"
          label={t('default-meta-description')}
          hint={t('default-meta-description-hint')}
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

        <Field id="defaultOgImage" label={t('default-og-image')}>
          <Uploader
            icon={IconPhoto}
            label={t('open-graph-image')}
            hint={t('og-image-hint')}
            value={settings.metaImage}
            onChange={(value) => updateSetting('metaImage', value)}
          />
        </Field>

        <SectionLabel>{t('keywords')}</SectionLabel>

        <Field
          label={t('meta-keywords')}
          hint={t('meta-keywords-hint')}
        >
          <MultipleSelector
            value={selectedKeywordOptions}
            options={selectedKeywordOptions}
            placeholder={t('select')}
            hidePlaceholderWhenSelected
            emptyIndicator={t('empty')}
            creatable
            inputProps={{ 'aria-label': 'Meta Keywords' }}
            onChange={handleKeywordChange}
          />
        </Field>

        <SectionLabel>{t('robots-indexing')}</SectionLabel>

        <Field
          label={t('search-engine-indexing')}
          hint={t('search-engine-indexing-hint')}
        >
          <div className="grid gap-2 md:grid-cols-2">
            <RobotsOption
              checked={settings.indexing === 'index'}
              title={t('index-site')}
              description={t('index-site-desc')}
              onClick={() => updateSetting('indexing', 'index')}
            />
            <RobotsOption
              checked={settings.indexing === 'noindex'}
              title={t('no-index')}
              description={t('no-index-desc')}
              onClick={() => updateSetting('indexing', 'noindex')}
            />
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection
        id="analytics"
        title={t('analytics')}
        badge={<Badge variant="success">{t('new')}</Badge>}
      >
        <SectionLabel>{t('google-analytics')}</SectionLabel>

        <Field
          id="gaTrackingId"
          label={t('ga-tracking-id')}
          hint={t('ga-tracking-id-hint')}
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
                {t('google-analytics-configured')}
              </div>
              <div className="truncate font-mono text-xs text-muted-foreground">
                {t('tracking-id-value', { id: settings.gaTrackingId })}
              </div>
            </div>
          </div>
        ) : null}

        <SectionLabel>{t('other-integrations')}</SectionLabel>

        <Field
          id="googleTagManagerId"
          label={t('google-tag-manager-id')}
          hint={t('google-tag-manager-id-hint')}
        >
          <Input
            id="googleTagManagerId"
            value={settings.googleTagManagerId}
            placeholder="GTM-XXXXXXX"
            onChange={(event) =>
              updateSetting('googleTagManagerId', event.target.value)
            }
            variant="secondary"
          />
        </Field>

        <Field
          id="customHeadScripts"
          label={t('custom-head-scripts')}
          hint={t('custom-head-scripts-hint')}
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

      <SettingsSection id="content" title={t('content')}>
        <Field
          id="postUrlPrefix"
          label={t('post-url-path')}
          hint={t('post-url-path-hint')}
        >
          <Input
            id="postUrlPrefix"
            value={settings.postUrlPrefix}
            placeholder="/posts"
            onChange={(event) =>
              updateSetting('postUrlPrefix', event.target.value)
            }
            variant="secondary"
          />
        </Field>

        <Field
          id="postUrlField"
          label={t('post-url-field')}
          hint={t('post-url-field-hint')}
        >
          <Select
            value={settings.postUrlField}
            onValueChange={(value) => updateSetting('postUrlField', value)}
          >
            <Select.Trigger id="postUrlField" className="bg-muted">
              <Select.Value placeholder={t('select-post-url-field')} />
            </Select.Trigger>
            <Select.Content>
              {POST_URL_FIELD_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <div className="mt-2 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <IconLink className="size-4 shrink-0" />
            <span className="min-w-0 truncate">{t('preview-url', { url: previewUrl })}</span>
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection id="languages" title={t('languages')}>
        <Field label={t('supported-languages')}>
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
            placeholder={t('select-languages')}
            commandProps={{ shouldFilter: false }}
          />
        </Field>

        <Field
          id="defaultLanguage"
          label={t('default-language')}
          hint={t('default-language-hint')}
        >
          <Select
            value={settings.defaultLanguage}
            onValueChange={(value) => updateSetting('defaultLanguage', value)}
            disabled={availableDefaultLanguages.length === 0}
          >
            <Select.Trigger id="defaultLanguage" className="bg-muted">
              <Select.Value placeholder={t('select-default-language')} />
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
        title={t('appearance')}
        badge={<Badge variant="secondary">{t('optional')}</Badge>}
      >
        <Field label={t('site-logo')}>
          <Uploader
            icon={IconPhoto}
            label={t('logo-image')}
            hint={t('logo-image-hint')}
            value={settings.siteLogo}
            onChange={(value) => updateSetting('siteLogo', value)}
          />
        </Field>

        <Field label={t('favicon')}>
          <Uploader
            icon={IconWorld}
            label={t('favicon')}
            hint={t('favicon-hint')}
            value={settings.favicon}
            onChange={(value) => updateSetting('favicon', value)}
          />
        </Field>
      </SettingsSection>

      <SettingsSection
        id="access"
        title={t('access-control')}
        badge={<Badge variant="secondary">{t('team')}</Badge>}
      >
        <Field
          label={t('who-can-manage-cms')}
          hint={t('who-can-manage-cms-hint')}
        >
          <div className="grid gap-2 md:grid-cols-2">
            <RobotsOption
              checked={settings.accessPolicy === 'open'}
              title={t('open-access')}
              description={t('open-access-desc')}
              onClick={() => updateSetting('accessPolicy', 'open')}
            />
            <RobotsOption
              checked={settings.accessPolicy === 'assigned'}
              title={t('assigned-members-only')}
              description={t('assigned-members-only-desc')}
              onClick={() => updateSetting('accessPolicy', 'assigned')}
            />
          </div>
        </Field>

        {settings.accessPolicy === 'assigned' ? (
          <Field
            label={t('assigned-team-members')}
            hint={t('assigned-team-members-hint')}
          >
            <SelectMember
              mode="multiple"
              value={settings.assignedMemberIds}
              onValueChange={(value) =>
                updateSetting(
                  'assignedMemberIds',
                  Array.isArray(value) ? value : value ? [value] : [],
                )
              }
              placeholder={t('select-team-members')}
            />
            <div className="mt-2 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {settings.assignedMemberIds.length ? (
                <>
                  <IconUsers className="size-4 shrink-0" />
                  <span>
                    {settings.assignedMemberIds.length} member
                    {settings.assignedMemberIds.length === 1 ? '' : 's'}{' '}
                    assigned
                  </span>
                </>
              ) : (
                <>
                  <IconLock className="size-4 shrink-0" />
                  <span>
                    {t('no-members-assigned-desc')}
                  </span>
                </>
              )}
            </div>
          </Field>
        ) : null}
      </SettingsSection>

      <SettingsSection
        id="delete"
        title={t('delete-cms')}
        className="border-destructive/40"
        contentClassName="space-y-0 p-0"
      >
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            {t('delete-cms-desc')}
          </p>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-sm font-medium">{cmsName}</div>
            <div className="text-xs text-muted-foreground">
              {cms?.domain ||
                cms?.publicUrl ||
                settings.domain ||
                settings.publicUrl ||
                t('no-public-url-set')}
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-destructive/20 bg-destructive/10 p-4">
          <Button
            type="button"
            variant="destructive"
            disabled={!cms?._id || isDeleting}
            onClick={() => handleDeleteDialogChange(true)}
          >
            <IconTrash className="size-4" />
            {t('delete-cms')}
          </Button>
        </div>
      </SettingsSection>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <Dialog.Content className="max-w-xl gap-0 overflow-hidden p-0">
          <Dialog.Header className="border-b p-6">
            <Dialog.Title>{t('delete-cms')}</Dialog.Title>
            <Dialog.Description>
              {t('delete-cms-dialog-desc')}
            </Dialog.Description>
          </Dialog.Header>

          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <label
                htmlFor={DELETE_NAME_CONFIRMATION_INPUT_ID}
                className="block text-sm leading-5 text-muted-foreground"
              >
                {t('to-confirm-type')}{' '}
                <span className="font-semibold text-foreground">
                  &quot;{cmsName}&quot;
                </span>
              </label>
              <Input
                id={DELETE_NAME_CONFIRMATION_INPUT_ID}
                value={deleteNameConfirmation}
                onChange={(event) =>
                  setDeleteNameConfirmation(event.target.value)
                }
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={DELETE_PHRASE_CONFIRMATION_INPUT_ID}
                className="block text-sm leading-5 text-muted-foreground"
              >
                {t('to-confirm-type')}{' '}
                <span className="font-semibold text-foreground">
                  &quot;{DELETE_CONFIRMATION_PHRASE}&quot;
                </span>
              </label>
              <Input
                id={DELETE_PHRASE_CONFIRMATION_INPUT_ID}
                value={deletePhraseConfirmation}
                onChange={(event) =>
                  setDeletePhraseConfirmation(event.target.value)
                }
              />
            </div>
          </div>

          <div className="border-y border-destructive/20 p-4">
            <div className="flex items-center gap-3 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <IconAlertTriangle className="size-5 shrink-0" />
              <span>{t('deleting-cms-cannot-be-undone', { name: cmsName })}</span>
            </div>
          </div>

          <Dialog.Footer className="flex-row items-center justify-between p-4 sm:justify-between sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDeleteDialogChange(false)}
              disabled={isDeleting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!canDeleteCMS}
              onClick={handleDelete}
            >
              {isDeleting ? t('deleting') : t('delete-cms')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
