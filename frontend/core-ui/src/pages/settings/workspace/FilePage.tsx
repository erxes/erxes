import { PageContainer, ScrollArea } from 'erxes-ui';
import FileUpload from '@/settings/file-upload/components/FileUpload';
import { SettingsBreadcrumbs } from '@/settings/components/SettingsBreadcrumbs';

export function FilePage() {
  return (
    <PageContainer>
      <SettingsBreadcrumbs />
      <ScrollArea>
        <section className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-12 px-4">File Upload</h2>
          <div className="flex flex-col gap-8 px-4 w-full h-auto">
            <FileUpload />
          </div>
        </section>
        <ScrollArea.Bar />
      </ScrollArea>
    </PageContainer>
  );
}
