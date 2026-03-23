import { useState } from 'react';
import { Form, Input, Tabs } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { LanguageSelector } from '~/modules/cms/shared/LanguageSelector';
import { MediaSection } from '~/modules/cms/posts/components/add-post-form/MediaSection';
import { SelectParentPage } from './SelectParentPage';
import { IPageFormData } from '../types/pageTypes';

interface LanguageOption {
  value: string;
  label: string;
  isDefault: boolean;
  hasTranslation: boolean;
}

interface PageSidebarPanelProps {
  form: UseFormReturn<IPageFormData>;
  websiteId: string;
  currentPageId?: string;
  availableLanguages: string[];
  selectedLanguage: string;
  languageOptions: LanguageOption[];
  handleLanguageChange: (lang: string) => void;
  isTranslationMode: boolean;
}

const SidebarTabs = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (v: string) => void;
}) => (
  <Tabs value={activeTab} onValueChange={onTabChange}>
    <Tabs.List className="border-none">
      <Tabs.Trigger value="content" className="w-full">
        Content
      </Tabs.Trigger>
      <Tabs.Trigger value="media" className="w-full">
        Media
      </Tabs.Trigger>
    </Tabs.List>
  </Tabs>
);

const ContentTab = ({
  form,
  websiteId,
  currentPageId,
  availableLanguages,
  selectedLanguage,
  languageOptions,
  handleLanguageChange,
  isTranslationMode,
}: Omit<PageSidebarPanelProps, 'form'> & {
  form: UseFormReturn<IPageFormData>;
}) => (
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
);

export const PageSidebarPanel = (props: PageSidebarPanelProps) => {
  const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');

  return (
    <div className="rounded-lg border flex flex-col mt-6">
      <div className="px-4 pt-1 border-b">
        <SidebarTabs
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as 'content' | 'media')}
        />
      </div>
      <div className="p-4 space-y-4">
        {activeTab === 'content' && <ContentTab {...props} />}
        {activeTab === 'media' && <MediaSection form={props.form} />}
      </div>
    </div>
  );
};
