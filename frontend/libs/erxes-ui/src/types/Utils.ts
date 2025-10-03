export interface IAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
}

export interface IPdfAttachment {
  pdf?: IAttachment;
  pages: IAttachment[];
}
