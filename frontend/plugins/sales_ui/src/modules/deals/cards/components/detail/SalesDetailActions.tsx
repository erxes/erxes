import { Button, Resizable, SideMenu, cn } from 'erxes-ui';
import { Icon, IconX } from '@tabler/icons-react';
// import { ActivityLogs } from '@/activity-logs/components/ActivityLogs';
// import { AddInternalNotes } from '@/internal-notes/components/AddInternalNotes';
import { useAtom, useSetAtom } from 'jotai';

import React from 'react';
import { salesDetailActiveActionTabAtom } from '@/deals/states/salesDetailStates';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useRelationWidget } from 'ui-modules';
import { useWidgetsModules } from '@/widgets/hooks/useWidgetsModules';

export const SalesDetailActions = () => {
  const { deal } = useDealDetail();
  const widgetsModules = useWidgetsModules();
  const { RelationWidget } = useRelationWidget();

  const [activeTab, setActiveTab] = useAtom(salesDetailActiveActionTabAtom);
  const panelRef = React.useRef<any>(null);

  // return (
  //   <Widget
  //     module={aa[0]}
  //     contentId={customerDetail?._id || ''}
  //     contentType="core:customer"
  //   />
  // );

  React.useEffect(() => {
    if (panelRef.current) {
      if (activeTab) {
        panelRef.current.expand();
      } else {
        panelRef.current.collapse();
      }
    }
  }, [activeTab]);

  return (
    <>
      <Resizable.Handle />
      <Resizable.Panel
        ref={panelRef}
        defaultSize={0}
        minSize={20}
        maxSize={60}
        collapsible={true}
        collapsedSize={0}
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
        <div className="h-full flex flex-col">
          {widgetsModules.map((item) => (
            <div
              key={item.name}
              className={cn(
                'h-full flex-col',
                activeTab === item.name ? 'flex' : 'hidden',
              )}
            >
              <ActionHeader title={item.name} icon={item.icon as any} />
              <div className="flex-1 overflow-y-auto">
                <RelationWidget
                  module={item}
                  contentId={deal?._id || ''}
                  contentType="sales:deal"
                />
              </div>
            </div>
          ))}
          {/* <ActionTabsContent
            value={actionTabs.notes.code}
            icon={actionTabs.notes.icon}
            title={actionTabs.notes.title}
          >
            <Resizable.PanelGroup direction="vertical" className="flex-auto">
              <Resizable.Panel className="overflow-y-auto!">
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
        </div>
      </Resizable.Panel>

      <div className="border-l flex flex-col gap-2 p-2 bg-background">
        {widgetsModules.map((item) => (
          <button
            key={item.name}
            onClick={() =>
              setActiveTab(activeTab === item.name ? '' : item.name)
            }
            className={cn(
              'flex flex-col items-center justify-center w-12 h-12 rounded hover:bg-accent transition-colors',
              activeTab === item.name && 'bg-accent',
            )}
            title={item.name}
          >
            <item.icon className="size-5" />
          </button>
        ))}
      </div>
    </>
  );
};

export const ActionHeader = (props: { title?: string; icon: Icon }) => {
  const setActiveTab = useSetAtom(salesDetailActiveActionTabAtom);
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
