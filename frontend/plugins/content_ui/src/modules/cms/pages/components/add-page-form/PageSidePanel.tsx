import { useState } from 'react';
import { Tabs } from 'erxes-ui';
import { PageContentTab } from './PageContentTab';
import { MediaSection } from '~/modules/cms/posts/components/add-post-form/MediaSection';

interface PageSidePanelProps {
  form: any;
  websiteId: string;
  currentPageId?: string;
  availableLanguages: string[];
  defaultLanguage: string;
  selectedLanguage: string;
  languageOptions: any[];
  handleLanguageChange: (lang: string) => void;
}

export const PageSidePanel = ({
  form,
  websiteId,
  currentPageId,
  availableLanguages,
  defaultLanguage,
  selectedLanguage,
  languageOptions,
  handleLanguageChange,
}: PageSidePanelProps) => {
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
          <PageContentTab
            form={form}
            websiteId={websiteId}
            currentPageId={currentPageId}
            availableLanguages={availableLanguages}
            defaultLanguage={defaultLanguage}
            selectedLanguage={selectedLanguage}
            languageOptions={languageOptions}
            handleLanguageChange={handleLanguageChange}
          />
        )}
        {activeTab === 'media' && <MediaSection form={form} />}
      </div>
    </div>
  );
};
