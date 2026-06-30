import { IconShieldCheck } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { ApprovalRequestsRecordTable } from '@/settings/approval/components/ApprovalRequestsRecordTable';

export const ApprovalRequestsPage = () => {
  const { t } = useTranslation('approval');

  return (
    <PageContainer>
      <div className="flex h-full flex-col pt-0">
        <PageHeader className="mx-0 p-3" separatorClassName="mb-0">
          <PageHeader.Start>
            <Breadcrumb>
              <Breadcrumb.List className="gap-1">
                <Breadcrumb.Item>
                  <Button variant="ghost">
                    <IconShieldCheck className="size-5" />
                    {t('approval-requests')}
                  </Button>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
            <Separator.Inline />
          </PageHeader.Start>
        </PageHeader>
        <ApprovalRequestsRecordTable />
      </div>
    </PageContainer>
  );
};
