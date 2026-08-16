export interface IVisitedPageTab {
  pathname: string;
  search?: string;
}

export interface IVisitedPageNavigationModule {
  name: string;
  path: string;
  icon?: React.ElementType;
  submenus?: IVisitedPageNavigationModule[];
}

export interface IVisitedPageTabLabels {
  details: string;
  myInbox: string;
}
