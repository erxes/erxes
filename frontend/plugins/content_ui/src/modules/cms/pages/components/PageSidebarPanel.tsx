import { useState } from 'react';
import { Form, Input, Tabs } from 'erxes-ui';
import { LanguageSelector } from '~/modules/cms/shared/LanguageSelector';
import { MediaSection } from '~/modules/cms/posts/components/add-post-form/MediaSection';
import { SelectParentPage } from './SelectParentPage';

interface PageSidebarPanelProps {
  form: any;
  websiteId: string;
  currentPageId?: string;
  availableLanguages: string[];
  defaultLanguage: string;
  selectedLanguage: string;
  languageOptions: any[];
  handleLanguageChange: (lang: string) => void;
  isTranslationMode: boolean;
}

export const PageSidebarPanel = ({
  form,
  websiteId,
  currentPageId,
  availableLanguages,
  defaultLanguage,
  selectedLanguage,
  languageOptions,
  handleLanguageChange,
  isTranslationMode,
}: PageSidebarPanelProps) => {
  const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');

  return (
    <div className="rounded-lg border flex flex-col mt-6">
      <div className="px-4 pt-1 border-b">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'content' | 'media')}
        >
          <Tabs.List className="border-none">
            <div className="flex justify-evenly items-center gap-4">
              <Tabs.Trigger value="content" className="w-full">
                Content
              </Tabs.Trigger>
              <Tabs.Trigger value="media" className="w-full">
                Media
              </Tabs.Trigger>
            </div>
          </Tabs.List>
        </Tabs>
      </div>
      <div className="p-4 space-y-4">
        {activeTab === 'content' && (
          <>
            {availableLanguages.length > 0 && (
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                languageOptions={languageOptions}
                onLanguageChange={handleLanguageChange}
              />
            )}

            <Form.Field
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Parent Page</Form.Label>
                  <SelectParentPage.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    websiteId={websiteId}
                    currentPageId={currentPageId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="path"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Slug
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-gray-500">
                        (shared across languages)
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="/about-us" required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </>
        )}
        {activeTab === 'media' && <MediaSection form={form} />}
      </div>
    </div>
  );
};
