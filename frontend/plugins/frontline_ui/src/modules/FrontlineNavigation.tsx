import {
  IconMail,
  IconDotsVertical,
  IconSettings,
  IconTicket,
  IconChartHistogram,
  IconCaretRightFilled,
} from '@tabler/icons-react';
import {
  NavigationMenuLinkItem,
  DropdownMenu,
  Button,
  Collapsible,
  Sidebar,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { IntegrationNavigation } from '@/integrations/components/IntegrationNavigation';
export const FrontlineNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative group/inbox">
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
              className="invisible group-hover/inbox:visible absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
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
              onSelect={() => navigate('/settings/frontline/channels')}
            >
              <IconSettings className="size-4" />
              Go to inbox settings
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      <NavigationMenuLinkItem
        name="Tickets"
        icon={IconTicket}
        path="frontline/tickets"
      />
      <IntegrationNavigation />
      <Collapsible className="group/collapsible cursor-pointer">
        <Sidebar.Group className="p-0">
          <Collapsible.Trigger asChild>
            <div className="w-full flex items-center justify-between">
              <Button variant="ghost" className="px-2 flex min-w-0 justify-start">
                <IconChartHistogram className="text-accent-foreground shrink-0" />
                <span className="font-sans font-semibold normal-case flex-1 min-w-0 capitalize">
                  Reports
                </span>
                <span className="ml-auto shrink-0">
                  <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-90 text-accent-foreground" />
                </span>
              </Button>
            </div>
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-1">
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <NavigationMenuLinkItem
                  name="Inbox"
                  pathPrefix="frontline/reports"
                  path="inbox"
                  className="pl-6 font-medium"
                />
                <NavigationMenuLinkItem
                  name="Ticket"
                  pathPrefix="frontline/reports"
                  path="ticket"
                  className="pl-6 font-medium"
                />
                <NavigationMenuLinkItem
                  name="Call"
                  pathPrefix="frontline/reports"
                  path="call"
                  className="pl-6 font-medium"
                />
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Collapsible.Content>
        </Sidebar.Group>
      </Collapsible>
    </>
  );
};
