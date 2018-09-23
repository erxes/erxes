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

export interface IBreadCrumbItem {
  title: string;
  link?: string;
}