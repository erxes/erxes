export type ChildPlugin = {
  to: string;
  text: string;
  scope: string;
  permission?: string;
  permissions?: string[];
  additional: boolean;
};

export type Plugin = {
  text: string;
  url?: string;
  icon?: string;
  name?: string;
  permission?: string;
  permissions?: string[];
  children?: ChildPlugin[];
  label?: React.ReactNode;
  isPinned?: boolean;
  location?: string;
  action?: string;
  image?: string;
  to?: string;
  scope?: string;
};

export type Action = {
  name: string,
  text: string,
  icon: string,
  url: string,
  type?: string
}

export type GeneralSetting = {
  name: string,
  text: string,
  icon: string,
  url:string
}
