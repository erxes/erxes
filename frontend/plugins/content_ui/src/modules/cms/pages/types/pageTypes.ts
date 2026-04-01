export interface IAttachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface IPage {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  clientPortalId?: string;
  thumbnail?: IAttachment | null;
  pageImages?: IAttachment[];
  video?: IAttachment | null;
  videoUrl?: string;
  audio?: IAttachment | null;
  documents?: IAttachment[];
  attachments?: IAttachment[];
  __typename?: string;
}

export interface IPageDrawerProps {
  page?: IPage;
  onClose: () => void;
  clientPortalId: string;
}

export interface IPageFormData {
  name: string;
  path: string;
  description?: string;
  parentId?: string;
  status: string;
  clientPortalId: string;
  thumbnail?: { url: string; name?: string; type?: string } | null;
  gallery?: string[];
  video?: string | null;
  videoUrl?: string;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
}

export interface IPagesRecordTableProps {
  clientPortalId: string;
  onEdit: (page: IPage) => void;
}
