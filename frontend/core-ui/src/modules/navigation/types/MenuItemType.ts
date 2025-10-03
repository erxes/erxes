import { Icon } from '@tabler/icons-react';

export interface SubmenuItem {
  name: string;
  path: string;
}

export interface PluginItem {
  name: string;
  icon: Icon;
  path: string;
  submenus?: SubmenuItem[];
}
