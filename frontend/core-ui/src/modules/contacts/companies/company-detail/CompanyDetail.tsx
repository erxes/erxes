import {
  Empty,
  FocusSheet,
  ScrollArea,
  Separator,
  Tabs,
  useQueryState,
} from 'erxes-ui';
import { useCompanyDetailWithQuery } from '../hooks/useCompanyDetailWithQuery';
import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { CompanyDetailFields } from './CompanyDetailFields';
import { CompanyDetailGeneral } from './CompanyDetailGeneral';
import { ContactSidebar } from '@/contacts/components/ContactSidebar';
import {
  ActivityLogs,
  AddInternalNote,
  FieldsInDetail,
  internalNoteCustomActivity,
  RelationWidgetSideTabs,
} from 'ui-modules';
import { useCompanyCustomFieldEdit } from '../hooks/useCompanyCustomFieldEdit';

export const CompanyDetail = () => {
  const [open, setOpen] = useQueryState<string>('companyId');
  const { companyDetail, loading, error } = useCompanyDetailWithQuery();
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <FocusSheet open={!!open} onOpenChange={() => setOpen(null)}>
      <FocusSheet.View
        loading={loading}
        notFound={!companyDetail}
        notFoundState={<CompanyDetailEmptyState />}
        errorState={<CompanyDetailErrorState />}
        error={!!error}
      >
        <FocusSheet.Header title="Company Details" />
        <FocusSheet.Content>
          <FocusSheet.SideBar>
            <ContactSidebar />
          </FocusSheet.SideBar>
          <div className="flex-1 flex flex-col overflow-hidden">
            <CompanyDetailGeneral />
            <Separator />
            <ScrollArea className="h-full">
              <Tabs
                value={selectedTab ?? 'overview'}
                onValueChange={setSelectedTab}
              >
                <Tabs.Content value="overview">
                  <CompanyDetailFields />
                  {!!companyDetail?._id && (
                    <div className="flex flex-col mb-12">
                      <ActivityLogs
                        targetId={companyDetail._id}
                        customActivities={[internalNoteCustomActivity]}
                      />
                      <AddInternalNote
                        contentTypeId={companyDetail._id}
                        contentType="core:company"
                      />
                    </div>
                  )}
                </Tabs.Content>
                <Tabs.Content value="properties" className="p-6">
                  <FieldsInDetail
                    fieldContentType="core:company"
                    propertiesData={companyDetail?.propertiesData || {}}
                    mutateHook={useCompanyCustomFieldEdit}
                    id={companyDetail?._id || ''}
                  />
                </Tabs.Content>
              </Tabs>
            </ScrollArea>
          </div>
          <RelationWidgetSideTabs
            contentId={open || ''}
            contentType="core:company"
            hookOptions={{
              hiddenModules: ['company'],
            }}
          />
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};

const CompanyDetailEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
        </Empty.Header>
        <Empty.Title>Company not found</Empty.Title>
        <Empty.Description>
          There seems to be no company with this ID.
        </Empty.Description>
      </Empty>
    </div>
  );
};

const CompanyDetailErrorState = () => {
  const { error } = useCompanyDetailWithQuery();
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>Error</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
