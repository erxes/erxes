import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { IconUser } from '@tabler/icons-react';
import { SideMenu } from 'erxes-ui';
import { CustomerWidget } from 'ui-modules';

export const ConversationSideWidget = () => {
  const { customerId } = useConversationContext();
  return (
    <SideMenu>
      <CustomerWidget
        customerId={customerId || ''}
        scope={InboxHotkeyScope.MainPage}
      />

      <SideMenu.Sidebar>
        <SideMenu.Trigger value="customer" label="Customer" Icon={IconUser} />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
