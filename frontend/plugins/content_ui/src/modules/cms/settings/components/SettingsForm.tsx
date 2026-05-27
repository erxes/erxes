import {
  IconAlertTriangle,
  IconChartBar,
  IconCheck,
  IconLink,
  IconPhoto,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
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

const POST_URL_FIELD_OPTIONS = [
  { value: '_id', label: 'Post ID', example: 'fSY5zj2QmcnXUNSnF9sYo' },
  { value: 'count', label: 'Post Count', example: '1' },
  { value: 'slug', label: 'Post Slug', example: 'my-first-post' },
];

const DELETE_CONFIRMATION_PHRASE = 'delete my project';
const DELETE_NAME_CONFIRMATION_INPUT_ID = 'delete-name-confirmation';
const DELETE_PHRASE_CONFIRMATION_INPUT_ID = 'delete-phrase-confirmation';

function trimTrailingSlashes(value: string): string {
  let endIndex = value.length;

  while (endIndex > 0 && value[endIndex - 1] === '/') {
    endIndex -= 1;
  }

  return value.slice(0, endIndex);
}

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
  const rawPublicUrl = settings.publicUrl.trim() || settings.domain.trim();
  let normalizedPublicUrl = '';

  if (rawPublicUrl) {
    normalizedPublicUrl = rawPublicUrl.startsWith('http')
      ? rawPublicUrl
      : `https://${rawPublicUrl}`;
  }
  const previewUrl = normalizedPublicUrl
    ? `${trimTrailingSlashes(normalizedPublicUrl)}/${
        selectedPostUrlField.example
      }`
    : `/${selectedPostUrlField.example}`;
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
        title="General"
        badge={<Badge variant="secondary">Base info</Badge>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="websiteName" label="Website Name" required>
            <Input
              id="websiteName"
              value={settings.websiteName}
              onChange={(event) =>
                updateSetting('websiteName', event.target.value)
              }
              variant="secondary"
            />
          </Field>

          <Field id="clientPortalKind" label="Client Portal (kind)">
            <Select
              value={settings.clientPortalKind}
              onValueChange={(value) =>
                updateSetting('clientPortalKind', value)
              }
            >
              <Select.Trigger id="clientPortalKind" className="bg-muted">
                <Select.Value placeholder="Select portal" />
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
          label="Short Description"
          hint="Used as fallback meta description if none set in SEO Defaults."
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
          <Field id="domain" label="Domain">
            <Input
              id="domain"
              value={settings.domain}
              onChange={(event) => updateSetting('domain', event.target.value)}
              variant="secondary"
            />
          </Field>

          <Field id="publicUrl" label="Public URL">
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
        title="SEO"
        badge={<Badge variant="success">New</Badge>}
      >
        <SectionLabel>Defaults</SectionLabel>

        <Field
          id="metaTitle"
          label="Default Meta Title"
          hint="Fallback for pages without an explicit title."
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
          label="Default Meta Description"
          hint="Max 160 characters recommended."
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

        <Field id="defaultOgImage" label="Default OG Image">
          <Uploader
            icon={IconPhoto}
            label="Open Graph Image"
            hint="Recommended: 1200x630px, PNG or JPG"
            value={settings.metaImage}
            onChange={(value) => updateSetting('metaImage', value)}
          />
        </Field>

        <SectionLabel>Keywords</SectionLabel>

        <Field
          label="Meta Keywords"
          hint="Injected into the meta keywords tag. Less critical for modern SEO but still used by some crawlers."
        >
          <MultipleSelector
            value={selectedKeywordOptions}
            options={selectedKeywordOptions}
            placeholder="Select"
            hidePlaceholderWhenSelected
            emptyIndicator="Empty"
            creatable
            inputProps={{ 'aria-label': 'Meta Keywords' }}
            onChange={handleKeywordChange}
          />
        </Field>

        <SectionLabel>Robots & Indexing</SectionLabel>

        <Field
          label="Search Engine Indexing"
          hint="Sets the global robots meta tag. Individual pages can override this."
        >
          <div className="grid gap-2 md:grid-cols-2">
            <RobotsOption
              checked={settings.indexing === 'index'}
              title="Index site"
              description="Allow crawlers to index pages"
              onClick={() => updateSetting('indexing', 'index')}
            />
            <RobotsOption
              checked={settings.indexing === 'noindex'}
              title="No index"
              description="Block all search engine crawling"
              onClick={() => updateSetting('indexing', 'noindex')}
            />
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection
        id="analytics"
        title="Analytics"
        badge={<Badge variant="success">New</Badge>}
      >
        <SectionLabel>Google Analytics</SectionLabel>

        <Field
          id="gaTrackingId"
          label="GA Tracking ID (gaTrackingId)"
          hint="Supports both GA4 (G-XXXXXXX) and Universal Analytics (UA-XXXXX-X) formats."
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
                Google Analytics configured
              </div>
              <div className="truncate font-mono text-xs text-muted-foreground">
                Tracking ID: {settings.gaTrackingId}
              </div>
            </div>
          </div>
        ) : null}

        <SectionLabel>Other Integrations</SectionLabel>

        <Field
          id="googleTagManagerId"
          label="Google Tag Manager ID"
          hint="Optional. If set, GTM will be used instead of direct GA injection."
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
          label="Custom Head Scripts"
          hint="Injected into head on every page. Use with care."
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

      <SettingsSection id="content" title="Content">
        <Field
          id="postUrlField"
          label="Post URL Field"
          hint="Choose which post field the public website will use in post URLs."
        >
          <Select
            value={settings.postUrlField}
            onValueChange={(value) => updateSetting('postUrlField', value)}
          >
            <Select.Trigger id="postUrlField" className="bg-muted">
              <Select.Value placeholder="Select post URL field" />
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
            <span className="min-w-0 truncate">Preview: {previewUrl}</span>
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection id="languages" title="Languages">
        <Field label="Supported Languages">
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
            placeholder="Select languages"
            commandProps={{ shouldFilter: false }}
          />
        </Field>

        <Field
          id="defaultLanguage"
          label="Default Language"
          hint="Used when no locale is specified in the URL."
        >
          <Select
            value={settings.defaultLanguage}
            onValueChange={(value) => updateSetting('defaultLanguage', value)}
            disabled={availableDefaultLanguages.length === 0}
          >
            <Select.Trigger id="defaultLanguage" className="bg-muted">
              <Select.Value placeholder="Select default language" />
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
        title="Appearance"
        badge={<Badge variant="secondary">Optional</Badge>}
      >
        <Field label="Site Logo">
          <Uploader
            icon={IconPhoto}
            label="Logo Image"
            hint="SVG or PNG, transparent background preferred"
            value={settings.siteLogo}
            onChange={(value) => updateSetting('siteLogo', value)}
          />
        </Field>

        <Field label="Favicon">
          <Uploader
            icon={IconWorld}
            label="Favicon"
            hint=".ico or 32x32 PNG"
            value={settings.favicon}
            onChange={(value) => updateSetting('favicon', value)}
          />
        </Field>
      </SettingsSection>

      <SettingsSection
        id="delete"
        title="Delete CMS"
        className="border-destructive/40"
        contentClassName="space-y-0 p-0"
      >
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            Permanently delete this CMS and its settings. This action cannot be
            undone.
          </p>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-sm font-medium">{cmsName}</div>
            <div className="text-xs text-muted-foreground">
              {cms?.domain ||
                cms?.publicUrl ||
                settings.domain ||
                settings.publicUrl ||
                'No public URL set'}
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
            Delete CMS
          </Button>
        </div>
      </SettingsSection>

      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <Dialog.Content className="max-w-xl gap-0 overflow-hidden p-0">
          <Dialog.Header className="border-b p-6">
            <Dialog.Title>Delete CMS</Dialog.Title>
            <Dialog.Description>
              This will permanently delete the CMS and related settings.
            </Dialog.Description>
          </Dialog.Header>

          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <label
                htmlFor={DELETE_NAME_CONFIRMATION_INPUT_ID}
                className="block text-sm leading-5 text-muted-foreground"
              >
                To confirm, type{' '}
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
                To confirm, type{' '}
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
              <span>Deleting {cmsName} cannot be undone.</span>
            </div>
          </div>

          <Dialog.Footer className="flex-row items-center justify-between p-4 sm:justify-between sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDeleteDialogChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!canDeleteCMS}
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting...' : 'Delete CMS'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
