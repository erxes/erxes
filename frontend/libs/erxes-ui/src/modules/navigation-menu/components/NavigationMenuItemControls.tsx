import { createContext, useContext } from 'react';

export interface INavigationMenuItemInfo {
  name: string;
  path: string;
  icon?: React.ElementType;
}

export interface INavigationMenuItemControls {
  getOrder: (path: string) => number | undefined;
  renderActions: (item: INavigationMenuItemInfo) => React.ReactNode;
}

export const NavigationMenuItemControlsContext =
  createContext<INavigationMenuItemControls | null>(null);

export const useNavigationMenuItemControls = () =>
  useContext(NavigationMenuItemControlsContext);
