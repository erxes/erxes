export interface IRouterProps {
  history: any;
  location: any;
  match: any;
}

export interface IAttachment {
  name: string;
  type: string;
  url: string;
}

export type IAttachmentPreview = {
  name: string;
  type: string;
  data: string;
} | null;

export interface IBreadCrumbItem {
  title: string;
  link?: string;
}

export interface ISubMenuItem {
  title: string;
  link?: string;
}

export interface IQueryParams {
  [key: string]: string;
}

export interface ISelectedOption {
  label: string;
  value: string;
}

export type IDateColumn = {
  month: number;
  year: number;
};
