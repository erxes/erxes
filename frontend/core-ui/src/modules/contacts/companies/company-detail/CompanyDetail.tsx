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
  RelationWidgetSideTabs,
} from 'ui-modules';
import { useCompanyCustomFieldEdit } from '../hooks/useCompanyCustomFieldEdit';
import { companyCustomActivities } from './CompanyActivityRows';

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
            <div className="flex-1 min-h-0">
              <Tabs
                value={selectedTab ?? 'overview'}
                onValueChange={setSelectedTab}
                className="h-full"
              >
                <Tabs.Content value="overview" className="h-full">
                  <ScrollArea className="h-full">
                    <CompanyDetailFields />
                    {!!companyDetail?._id && (
                      <div className="flex flex-col mb-12">
                        <ActivityLogs
                          targetId={companyDetail._id}
                          customActivities={companyCustomActivities}
                          limit={10}
                        />
                        <AddInternalNote
                          contentTypeId={companyDetail._id}
                          contentType="core:company"
                        />
                      </div>
                    )}
                  </ScrollArea>
                </Tabs.Content>
                <Tabs.Content value="properties" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <FieldsInDetail
                        fieldContentType="core:company"
                        propertiesData={companyDetail?.propertiesData || {}}
                        mutateHook={useCompanyCustomFieldEdit}
                        id={companyDetail?._id || ''}
                      />
                    </div>
                  </ScrollArea>
                </Tabs.Content>
                <Tabs.Content value="activity" className="h-full">
                  <div className="h-full flex flex-col">
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="pt-3">
                        <ActivityLogs
                          targetId={companyDetail?._id || ''}
                          customActivities={companyCustomActivities}
                          variant="backward"
                        />
                      </div>
                    </ScrollArea>

                    {!!companyDetail?._id && (
                      <div className="shrink-0 pb-6 pt-2">
                        <AddInternalNote
                          contentTypeId={companyDetail._id}
                          contentType="core:company"
                        />
                      </div>
                    )}
                  </div>
                </Tabs.Content>
              </Tabs>
            </div>
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
