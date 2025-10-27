import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { IconUser } from '@tabler/icons-react';
import { SideMenu } from 'erxes-ui';
import { CustomerWidget, useRelationWidget } from 'ui-modules';

export const ConversationSideWidget = () => {
  const { customerId, _id } = useConversationContext();
  const { relationWidgetsModules, RelationWidget } = useRelationWidget();

  return (
    <SideMenu>
      <SideMenu.Content value="customer">
        <SideMenu.Header Icon={IconUser} label="Customer Details" />
        {customerId && (
          <CustomerWidget
            customerId={customerId}
            scope={InboxHotkeyScope.MainPage}
          />
        )}
      </SideMenu.Content>

      {relationWidgetsModules.map((module) => {
        return (
          <SideMenu.Content value={module.name} key={module.name}>
            <RelationWidget
              key={module.name}
              module={module.name}
              pluginName={module.pluginName}
              contentId={_id}
              contentType="inbox:conversation"
              customerId={customerId}
            />
          </SideMenu.Content>
        );
      })}

      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="customer"
          label="Customer Details"
          Icon={IconUser}
        />
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
