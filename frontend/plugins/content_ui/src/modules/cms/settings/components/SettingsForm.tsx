import {
  IconChartBar,
  IconCheck,
  IconPhoto,
  IconWorld,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Input,
  Select,
  Switch,
  Textarea,
  ToggleGroup,
} from 'erxes-ui';
import {
  ClientPortalOption,
  SettingsFormState,
  UpdateSetting,
} from '../types/settingsTypes';
import { languageLabel } from '../utils/settingsHelpers';
import { RobotsOption } from './RobotsOption';
import {
  SettingsField as Field,
  SettingsSectionLabel as SectionLabel,
} from './SettingsField';
import { SettingsSection } from './SettingsSection';
import { UploadPlaceholder } from './UploadPlaceholder';

export const SettingsForm = ({
  settings,
  clientPortals,
  updateSetting,
  onRemoveLanguage,
  onTodoAction,
}: {
  settings: SettingsFormState;
  clientPortals: ClientPortalOption[];
  updateSetting: UpdateSetting;
  onRemoveLanguage: (language: string) => void;
  onTodoAction: () => void;
}) => {
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
                ) : (
                  <Select.Item value={settings.clientPortalKind}>
                    Portal A
                  </Select.Item>
                )}
              </Select.Content>
            </Select>
          </Field>
        </div>

        <Field
          id="shortDescription"
          label="Short Description"
          hint="Used as fallback meta description if none set in SEO Defaults."
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
          <UploadPlaceholder
            icon={IconPhoto}
            label="Open Graph Image"
            hint="Recommended: 1200x630px, PNG or JPG"
            onClick={onTodoAction}
          />
        </Field>

        <SectionLabel>Keywords</SectionLabel>

        <Field
          label="Meta Keywords"
          hint="Injected into the meta keywords tag. Less critical for modern SEO but still used by some crawlers."
        >
          <div className="flex flex-wrap gap-2">
            {settings.metaKeywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="success"
                onClose={() =>
                  updateSetting(
                    'metaKeywords',
                    settings.metaKeywords.filter((item) => item !== keyword),
                  )
                }
              >
                {keyword}
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="border-dashed"
              onClick={onTodoAction}
            >
              Add keyword
            </Button>
          </div>
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

        <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 p-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-success text-success-foreground">
            <IconCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-success">
              Connected - Google Analytics 4
            </div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              Tracking ID: {settings.gaTrackingId} - Data stream active
            </div>
          </div>
        </div>

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
            className="min-h-20 bg-muted font-mono text-xs"
          />
        </Field>
      </SettingsSection>

      <SettingsSection id="content" title="Content">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Post URL Format (postUrlField)"
            hint="How post URLs are generated."
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
                  {value}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </Field>

          <Field
            id="postsPerPage"
            label="Posts Per Page"
            hint="Pagination chunk size."
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
          <Field label="Default Post Status">
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
                Draft
              </ToggleGroup.Item>
              <ToggleGroup.Item value="published" className="h-7 px-3 text-xs">
                Published
              </ToggleGroup.Item>
            </ToggleGroup>
          </Field>

          <Field label="Comments">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div>
                <div className="text-sm font-medium">Allow comments</div>
                <div className="text-xs text-muted-foreground">
                  Enable comment threads on posts
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

      <SettingsSection id="languages" title="Languages">
        <Field label="Supported Languages">
          <div className="flex flex-wrap gap-2">
            {settings.languages.map((language) => (
              <Badge
                key={language}
                variant="secondary"
                onClose={
                  settings.languages.length > 1
                    ? () => onRemoveLanguage(language)
                    : undefined
                }
              >
                {languageLabel(language)}
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="border-dashed"
              onClick={onTodoAction}
            >
              Add language
            </Button>
          </div>
        </Field>

        <Field
          id="defaultLanguage"
          label="Default Language"
          hint="Used when no locale is specified in the URL."
        >
          <Select
            value={settings.defaultLanguage}
            onValueChange={(value) => updateSetting('defaultLanguage', value)}
          >
            <Select.Trigger id="defaultLanguage" className="bg-muted">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {settings.languages.map((language) => (
                <Select.Item key={language} value={language}>
                  {languageLabel(language)}
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
          <UploadPlaceholder
            icon={IconPhoto}
            label="Logo Image"
            hint="SVG or PNG, transparent background preferred"
            onClick={onTodoAction}
          />
        </Field>

        <Field label="Favicon">
          <UploadPlaceholder
            icon={IconWorld}
            label="Favicon"
            hint=".ico or 32x32 PNG"
            onClick={onTodoAction}
          />
        </Field>
      </SettingsSection>
    </div>
  );
};
