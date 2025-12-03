import React from 'react';
import { Icon, IconX } from '@tabler/icons-react';
import { Button, SideMenu } from 'erxes-ui';
import { customerDetailActiveActionTabAtom } from '@/contacts/states/customerDetailStates';

import { useSetAtom } from 'jotai';
import { useRelationWidget } from 'ui-modules';
import { useRelationWidgetsModules } from '@/widgets/hooks/useRelationWidgets';
import { useCustomerDetailWithQuery } from '../../hooks/useCustomerDetailWithQuery';

export const CustomerDetailActions = () => {
  const { customerDetail } = useCustomerDetailWithQuery();
  const contactId = customerDetail?._id;

  const { relationWidgetsModules, RelationWidget } = useRelationWidget({
    hiddenModules: ['customer'],
  });

  return (
    <SideMenu>
      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content value={module.name} key={module.name}>
            <RelationWidget
              key={module.name}
              module={module.name}
              pluginName={module.pluginName}
              contentId={contactId || ''}
              contentType="core:customer"
              customerId={contactId}
            />
          </SideMenu.Content>
        );
      })}

      <SideMenu.Sidebar>
        {relationWidgetsModules.map((module) => {
          return (
            <SideMenu.Trigger
              key={module.name}
              value={module.name}
              label={module.name}
              Icon={module.icon}
            />
          );
        })}
      </SideMenu.Sidebar>
    </SideMenu>
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
