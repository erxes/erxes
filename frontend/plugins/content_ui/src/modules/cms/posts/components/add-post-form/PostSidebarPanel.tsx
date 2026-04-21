import { useState } from 'react';
import { Tabs } from 'erxes-ui';
import { ContentTab } from './ContentTab';
import { MediaSection } from './MediaSection';

interface PostSidebarPanelProps {
  form: any;
  categories: any[];
  tags: any[];
  customTypes: any[];
  websiteId: string;
  availableLanguages: string[];
  defaultLanguage: string;
  selectedLanguage: string;
  languageOptions: any[];
  handleLanguageChange: (lang: string) => void;
}

export const PostSidebarPanel = ({
  form,
  categories,
  tags,
  customTypes,
  websiteId,
  availableLanguages,
  defaultLanguage,
  selectedLanguage,
  languageOptions,
  handleLanguageChange,
}: PostSidebarPanelProps) => {
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
      <form className="p-4 space-y-4">
        {activeTab === 'content' && (
          <ContentTab
            form={form}
            categories={categories}
            tags={tags}
            customTypes={customTypes}
            websiteId={websiteId}
            availableLanguages={availableLanguages}
            defaultLanguage={defaultLanguage}
            selectedLanguage={selectedLanguage}
            languageOptions={languageOptions}
            handleLanguageChange={handleLanguageChange}
          />
        )}
        {activeTab === 'media' && <MediaSection form={form} />}
      </form>
    </div>
  );
};
