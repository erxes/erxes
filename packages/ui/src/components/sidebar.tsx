import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarSeparator,
} from './sidebar/layout';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from './sidebar/group';
import { SidebarInset, SidebarRail, SidebarRoot } from './sidebar/root';
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from './sidebar/menu';
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from './sidebar/menu-sub';
import { SidebarPanel, SidebarPanelTrigger } from './sidebar/panel';
import {
  SidebarProvider,
  useOptionalSidebar,
  useSidebar,
} from './sidebar/context';

import { SidebarTreeIndicator } from './sidebar-tree-indicator';
import { SidebarTrigger } from './sidebar/trigger';

export const Sidebar = Object.assign(SidebarRoot, {
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  GroupAction: SidebarGroupAction,
  GroupContent: SidebarGroupContent,
  GroupLabel: SidebarGroupLabel,
  Header: SidebarHeader,
  Input: SidebarInput,
  Inset: SidebarInset,
  Panel: SidebarPanel,
  PanelTrigger: SidebarPanelTrigger,
  Menu: SidebarMenu,
  MenuAction: SidebarMenuAction,
  MenuBadge: SidebarMenuBadge,
  MenuButton: SidebarMenuButton,
  MenuItem: SidebarMenuItem,
  MenuSkeleton: SidebarMenuSkeleton,
  Sub: SidebarMenuSub,
  TreeIndicator: SidebarTreeIndicator,
  SubButton: SidebarMenuSubButton,
  SubItem: SidebarMenuSubItem,
  Provider: SidebarProvider,
  Rail: SidebarRail,
  Separator: SidebarSeparator,
  Trigger: SidebarTrigger,
  useOptionalSidebar,
  useSidebar,
});
