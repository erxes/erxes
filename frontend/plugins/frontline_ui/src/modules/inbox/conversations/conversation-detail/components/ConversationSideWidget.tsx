import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { SideMenu } from 'erxes-ui';
import { CustomerWidget, CustomerWidgetTrigger } from 'ui-modules';

export const ConversationSideWidget = () => {
  const { customerId } = useConversationContext();
  return (
    <SideMenu>
      <CustomerWidget
        customerIds={[customerId || '', customerId || '']}
        scope={InboxHotkeyScope.MainPage}
      />

      <SideMenu.Sidebar>
        <CustomerWidgetTrigger />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
