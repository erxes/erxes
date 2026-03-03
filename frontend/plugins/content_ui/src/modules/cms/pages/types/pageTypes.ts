export interface IPage {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  clientPortalId?: string;
  __typename?: string;
}

export interface IPageDrawerProps {
  page?: IPage;
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
}

export interface IPageFormData {
  name: string;
  path: string;
  description?: string;
  status: string;
  clientPortalId: string;
}

export interface IPagesRecordTableProps {
  clientPortalId: string;
  onEdit: (page: IPage) => void;
}
