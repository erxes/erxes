import { IconBuilding } from '@tabler/icons-react';
import { CopyText, PageContainer, PageHeader } from 'erxes-ui';
import type { ReactNode } from 'react';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { useSession } from '~/modules/auth/session';

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[200px_1fr] sm:items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="min-w-0 text-sm">{children}</span>
  </div>
);

/** Settings › Organization. */
export const OrganizationPage = () => {
  const { organization } = useSession();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: 'Organization', to: '/settings/organization', icon: IconBuilding }]}
          />
        </PageHeader.Start>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <section className="mx-auto max-w-3xl divide-y rounded-lg border bg-background">
          <Row label="Name">{organization.name}</Row>
          <Row label="Address">{organization.subdomain}</Row>
          <Row label="Organization ID">
            <span className="flex items-center gap-2 font-mono text-xs">
              {organization.id}
              <CopyText value={organization.id}>{null}</CopyText>
            </span>
          </Row>
          <Row label="Created">{new Date(organization.createdAt).toLocaleDateString()}</Row>
        </section>
      </div>
    </PageContainer>
  );
};
