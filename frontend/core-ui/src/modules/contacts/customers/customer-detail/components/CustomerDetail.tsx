import {
  Empty,
  FocusSheet,
  ScrollArea,
  Separator,
  Tabs,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  AddInternalNote,
  FieldsInDetail,
  internalNoteCustomActivity,
  RelationWidgetSideTabs,
} from 'ui-modules';
import { CustomerDetailGeneral } from './CustomerDetailGeneral';
import { CustomerDetailFields } from './CustomerDetailFields';
import { useCustomerDetailWithQuery } from '../../hooks/useCustomerDetailWithQuery';
import { useCustomerCustomFieldEdit } from '../../hooks/useEditCustomerCustomFields';
import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { ContactSidebar } from '@/contacts/components/ContactSidebar';
import { useIsCustomerLeadSessionKey } from '../../hooks/useCustomerLeadSessionKey';

export const CustomerDetail = () => {
  const { t } = useTranslation('contact');
  const [open, setOpen] = useQueryState<string>('contactId');
  const { customerDetail, loading, error } = useCustomerDetailWithQuery();
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { isLead } = useIsCustomerLeadSessionKey();

  return (
    <FocusSheet open={!!open} onOpenChange={() => setOpen(null)}>
      <FocusSheet.View
        loading={loading}
        error={!!error}
        notFound={!customerDetail}
        notFoundState={<CustomerDetailEmptyState />}
        errorState={<CustomerDetailErrorState />}
      >
        <FocusSheet.Header
          title={
            isLead
              ? t('lead.detail.lead-detail')
              : t('customer.detail.customer-detail')
          }
        />
        <FocusSheet.Content>
          <FocusSheet.SideBar>
            <ContactSidebar />
          </FocusSheet.SideBar>
          <div className="flex-1 flex flex-col overflow-hidden">
            <CustomerDetailGeneral />
            <Separator />
            <ScrollArea className="h-full">
              <Tabs
                value={selectedTab ?? 'overview'}
                onValueChange={setSelectedTab}
              >
                <Tabs.Content value="overview">
                  <CustomerDetailFields />
                  {!!customerDetail?._id && (
                    <div className="flex flex-col mb-12">
                      <ActivityLogs
                        targetId={customerDetail?._id || ''}
                        customActivities={[internalNoteCustomActivity]}
                      />
                      <AddInternalNote
                        contentTypeId={customerDetail._id}
                        contentType="core:customer"
                      />
                    </div>
                  )}
                </Tabs.Content>
                <Tabs.Content value="properties" className="p-6">
                  <FieldsInDetail
                    fieldContentType="core:customer"
                    propertiesData={customerDetail?.propertiesData || {}}
                    mutateHook={useCustomerCustomFieldEdit}
                    id={customerDetail?._id || ''}
                  />
                </Tabs.Content>
              </Tabs>
            </ScrollArea>
          </div>
          <RelationWidgetSideTabs
            contentId={open || ''}
            contentType="core:customer"
            hookOptions={{
              hiddenModules: ['customer'],
            }}
          />
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};

const CustomerDetailEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>Customer not found</Empty.Title>
          <Empty.Description>
            There seems to be no customer with this ID.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

const CustomerDetailErrorState = () => {
  const { error } = useCustomerDetailWithQuery();
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
