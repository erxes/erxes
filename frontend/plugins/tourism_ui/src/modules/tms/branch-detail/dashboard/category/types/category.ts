export interface IAttachment {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface ICategory {
  _id: string;
  name?: string;
  parentId?: string;
  order?: string;
  attachment?: IAttachment;
}
