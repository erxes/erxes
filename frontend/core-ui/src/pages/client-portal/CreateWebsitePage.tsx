import { PageContainer } from 'erxes-ui';
import { WebsiteForm } from '@/client-portal/components/WebsiteForm';

export default function CreateWebsitePage() {
  return (
    <PageContainer className="overflow-auto">
      <div className="p-4 space-y-4">
        <WebsiteForm />
      </div>
    </PageContainer>
  );
}
