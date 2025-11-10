import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Collapsible,
  DropdownMenu,
  IconComponent,
  NavigationMenuGroup,
  NavigationMenuLinkItem,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useToast,
} from 'erxes-ui';
import {
  IconRestore,
  IconCaretRightFilled,
  IconChecklist,
  IconClipboard,
  IconDotsVertical,
  IconLink,
  IconSettings,
} from '@tabler/icons-react';
import { useGetPos } from '@/pos/hooks/useGetPos';

type Pos = {
  _id: string;
  name: string;
  icon?: string;
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  );
}
const POS_PATH_PREFIX = 'sales';
interface posItemProps {
  pos: Pos;
}

function PosItem({ pos }: posItemProps) {
  return (
    <Collapsible className="group/collapsible">
      <Sidebar.Group className="p-0">
        <div className="w-full relative group/trigger hover:cursor-pointer">
          <Collapsible.Trigger asChild>
            <div className="w-full flex items-center justify-between">
              <Button
                variant="ghost"
                className="px-2 flex min-w-0 justify-start"
              >
                <IconComponent
                  name={pos.icon}
                  className="text-accent-foreground flex-shrink-0"
                />
                <TextOverflowTooltip
                  className="font-sans font-semibold normal-case flex-1 min-w-0"
                  value={pos.name}
                />
                <span className="ml-auto flex-shrink-0">
                  <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-90 text-accent-foreground" />
                </span>
              </Button>
              <div className="size-5 min-w-5 mr-2"></div>
            </div>
          </Collapsible.Trigger>
          <PosActionsMenu pos={pos} />
        </div>
        <Collapsible.Content className="pt-1 ">
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <NavigationMenuLinkItem
                name="Orders"
                pathPrefix={POS_PATH_PREFIX}
                className="pl-6 font-medium"
                icon={IconClipboard}
                path={`pos/${pos._id}/orders`}
              />
              <NavigationMenuLinkItem
                name="Pos Covers"
                pathPrefix={POS_PATH_PREFIX}
                path={`pos/${pos._id}/covers`}
                className="pl-6 font-medium"
                icon={IconChecklist}
              />
              <NavigationMenuLinkItem
                name="Pos By Items"
                pathPrefix={POS_PATH_PREFIX}
                path={`pos/${pos._id}/by-items`}
                className="pl-6 font-medium"
                icon={IconChecklist}
              />
              <NavigationMenuLinkItem
                name="Pos Items"
                pathPrefix={POS_PATH_PREFIX}
                className="pl-6 font-medium"
                icon={IconClipboard}
                path={`pos/${pos._id}/items`}
              />
              <NavigationMenuLinkItem
                name="Pos Summary"
                pathPrefix={POS_PATH_PREFIX}
                path={`pos/${pos._id}/summary`}
                className="pl-6 font-medium"
                icon={IconChecklist}
              />
              <NavigationMenuLinkItem
                name="Pos Orders By Customer"
                pathPrefix={POS_PATH_PREFIX}
                path={`pos/${pos._id}/orders-by-customer`}
                className="pl-6 font-medium"
                icon={IconChecklist}
              />
              <NavigationMenuLinkItem
                name="Pos Orders By Subscription"
                pathPrefix={POS_PATH_PREFIX}
                path={`pos/${pos._id}/orders-by-subscription`}
                className="pl-6 font-medium"
                icon={IconChecklist}
              />
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
}

export function PosOrderNavigation() {
  const currentUser = useAtomValue(currentUserState);
  const { pos, loading } = useGetPos({
    variables: { userId: currentUser?._id },
  });

  return (
    <NavigationMenuGroup name="POS order">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        pos?.map((pos) => <PosItem key={pos._id} pos={pos} />)
      )}
    </NavigationMenuGroup>
  );
}

const PosActionsMenu = ({ pos }: { pos: Pos }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const posLink = `${window.location.origin}/sales/pos/${pos._id}/orders`;
    try {
      await navigator.clipboard.writeText(posLink);
      toast({
        variant: 'default',
        title: 'Link copied to clipboard',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy link',
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="invisible group-hover/trigger:visible absolute top-1/2 -translate-y-1/2 right-1 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="right" align="start" className="w-60 min-w-0">
        <DropdownMenu.Item
          className="cursor-pointer"
          onSelect={(e) => {
            navigate(`/settings/sales/pos/details/${pos._id}`);
          }}
        >
          <IconSettings className="size-4" />
          Go to pos settings
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={(e) => {
            handleCopyLink();
          }}
          className="cursor-pointer"
        >
          <IconLink className="size-4" />
          Copy link
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
