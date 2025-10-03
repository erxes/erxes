import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { IconUser } from '@tabler/icons-react';
import { SideMenu } from 'erxes-ui';
import { CustomerWidget } from 'ui-modules';

export const ConversationSideWidget = () => {
  const { customerId } = useConversationContext();
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
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="customer"
          label="Customer Details"
          Icon={IconUser}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
