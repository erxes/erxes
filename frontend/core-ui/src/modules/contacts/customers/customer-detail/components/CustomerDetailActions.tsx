import React from 'react';
import { Icon, IconX } from '@tabler/icons-react';
import {
  Button,
  Resizable,
  SideMenu,
  // Tabs,
  // Tooltip,
  cn,
  // useQueryState,
} from 'erxes-ui';
import { customerDetailActiveActionTabAtom } from '@/contacts/states/customerDetailStates';
// import { ActivityLogs } from '@/activity-logs/components/ActivityLogs';
// import { AddInternalNotes } from '@/internal-notes/components/AddInternalNotes';
import { useAtom, useSetAtom } from 'jotai';
import { useRelationWidget } from 'ui-modules';
import { useRelationWidgetsModules } from '@/widgets/hooks/useRelationWidgetsModules';
import { useCustomerDetailWithQuery } from '../../hooks/useCustomerDetailWithQuery';

export const CustomerDetailActions = () => {
  const { customerDetail } = useCustomerDetailWithQuery();
  const contactId = customerDetail?._id;
  const [activeTab, setActiveTab] = useAtom(customerDetailActiveActionTabAtom);
  const widgetsModules = useRelationWidgetsModules();
  const { RelationWidget } = useRelationWidget();

  // return (
  //   <Widget
  //     module={aa[0]}
  //     contentId={customerDetail?._id || ''}
  //     contentType="core:customer"
  //   />
  // );

  return (
    <>
      <Resizable.Handle />
      <Resizable.Panel
        minSize={activeTab ? 30 : 0}
        maxSize={activeTab ? 60 : 0}
      >
        <SideMenu
          orientation="vertical"
          value={activeTab ?? ''}
          onValueChange={(value) => setActiveTab(value)}
          className={cn('h-full')}
        >
          {/* <ActionTabsContent
            value={actionTabs.activity.code}
            icon={actionTabs.activity.icon}
            title={actionTabs.activity.title}
          >
            <div className="flex-auto overflow-y-auto">
              <ActivityLogs
                operation={{
                  variables: {
                    contentType: 'core:customers',
                    contentId: contactId,
                  },
                  skip: !contactId,
                }}
              />
            </div>
          </ActionTabsContent> */}
          {widgetsModules.map((item) => (
            <ActionTabsContent
              key={item.name}
              value={item.name}
              icon={item.icon as any}
              title={item.name}
            >
              <RelationWidget
                module={item.name}
                pluginName={item.pluginName}
                contentId={contactId || ''}
                contentType="core:customer"
              />
            </ActionTabsContent>
          ))}
          {/* <ActionTabsContent
            value={actionTabs.notes.code}
            icon={actionTabs.notes.icon}
            title={actionTabs.notes.title}
          >
            <Resizable.PanelGroup direction="vertical" className="flex-auto">
              <Resizable.Panel className="!overflow-y-auto">
                <ActivityLogs
                  operation={{
                    variables: {
                      contentType: 'core:customer',
                      contentId: contactId,
                      activityType: 'core:internalNote',
                    },
                    skip: !contactId,
                  }}
                />
              </Resizable.Panel>
              <Resizable.Handle />
              <Resizable.Panel minSize={25} maxSize={60}>
                <AddInternalNotes
                  contentTypeId={contactId || ''}
                  contentType="core:customer"
                />
              </Resizable.Panel>
            </Resizable.PanelGroup>
          </ActionTabsContent> */}
        </SideMenu>
      </Resizable.Panel>
      <CustomerDetailActionsTrigger />
    </>
  );
};

export const CustomerDetailActionsTrigger = () => {
  const [activeTab, setActiveTab] = useAtom(customerDetailActiveActionTabAtom);
  const widgetsModules = useRelationWidgetsModules();

  return (
    <div className="flex flex-none overflow-hidden">
      <SideMenu
        orientation="vertical"
        value={activeTab ?? ''}
        onValueChange={(value) => setActiveTab(value)}
        className="h-full"
      >
        <SideMenu.Sidebar className="border-l-0">
          {widgetsModules.map((item) => (
            <SideMenu.Trigger
              key={item.name}
              value={item.name}
              label={item.name}
              Icon={item.icon as any}
            />
          ))}
        </SideMenu.Sidebar>
      </SideMenu>
    </div>
  );
};

export const ActionTabsContent = ({
  children,
  value,
  title,
  icon,
}: {
  children: React.ReactNode;
  value: string;
  title?: string;
  icon: Icon;
}) => {
  // const [activeTab] = useAtom(customerDetailActiveActionTabAtom);

  return (
    <SideMenu.Content
      value={value}
      className="border-l-0 data-[state=active]:border-l-0 bg-background"
    >
      <ActionHeader title={title} icon={icon} />
      {children}
    </SideMenu.Content>
  );
};

export const ActionHeader = (props: { title?: string; icon: Icon }) => {
  const setActiveTab = useSetAtom(customerDetailActiveActionTabAtom);
  return (
    <div className="flex items-center h-12 border-b px-6 text-primary gap-2 flex-none">
      <props.icon className="size-5" />
      <h4 className="font-semibold text-base">{props.title}</h4>
      <Button
        variant="secondary"
        size="icon"
        className="ml-auto"
        onClick={() => setActiveTab('')}
      >
        <IconX />
      </Button>
    </div>
  );
};
