import {
  IconRobot,
  IconMessageCircle,
  IconSitemap,
  IconBulb,
  IconCalendarTime,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';
import { useHasAnyActivity } from '~/modules/chat/hooks/useChatView';

const ChatNavItem = () => {
  // Show dot when any agent is thinking or has an unread AI reply
  const hasAnyUnread = useHasAnyActivity();

  return (
    <div className="relative">
      <NavigationMenuLinkItem
        name="Chat"
        icon={IconMessageCircle}
        path="erxes-agent/chat"
      />
      {hasAnyUnread && (
        <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500 pointer-events-none" />
      )}
    </div>
  );
};

export const MastraNavigation = () => {
  return (
    <>
      <ChatNavItem />
      <NavigationMenuLinkItem
        name="Agents"
        icon={IconRobot}
        path="erxes-agent/agents"
      />
      <NavigationMenuLinkItem
        name="Workflows"
        icon={IconSitemap}
        path="erxes-agent/workflows"
      />
      <NavigationMenuLinkItem
        name="Schedules"
        icon={IconCalendarTime}
        path="erxes-agent/schedules"
      />
      <NavigationMenuLinkItem
        name="Agent learnings"
        icon={IconBulb}
        path="erxes-agent/learnings"
      />
    </>
  );
};
