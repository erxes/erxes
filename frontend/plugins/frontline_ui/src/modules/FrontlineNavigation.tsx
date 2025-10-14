import { IntegrationNavigation } from '@/integrations/components/IntegrationNavigation';
import {
  IconMail,
  IconMessageReply,
  IconDotsVertical,
  IconSettings,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, DropdownMenu, Button } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export const FrontlineNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative group">
        <NavigationMenuLinkItem
          name="Inbox"
          icon={IconMail}
          path="frontline/inbox"
        />

        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="invisible group-hover:visible absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            side="right"
            align="start"
            className="w-60 min-w-0"
          >
            <DropdownMenu.Item
              className="cursor-pointer"
              onSelect={() => navigate('/settings/inbox')}
            >
              <IconSettings className="size-4" />
              Go to inbox settings
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      <NavigationMenuLinkItem
        name="Ticket"
        icon={IconMessageReply}
        path="frontline/ticket"
      />

      <IntegrationNavigation />
    </>
  );
};
