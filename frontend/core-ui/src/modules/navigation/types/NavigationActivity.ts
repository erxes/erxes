export interface INavigationActivityModule {
  name: string;
  path: string;
  icon?: React.ElementType;
  submenus?: INavigationActivityModule[];
}

export interface INavigationActivity {
  id: string;
  label: string;
  icon?: React.ElementType;
  kind: 'plugin' | 'core';
  modules: INavigationActivityModule[];
  defaultPath: string;
}
