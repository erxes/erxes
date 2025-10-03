export interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface IPdfAttachment {
  pdf?: IAttachment;
  pages: IAttachment[];
}

export interface ILocationOption {
  lat: number;
  lng: number;
  description?: string;
}

export interface ICombinedParams {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
  segmentId?: string;
  config?: any;
  onlyDates?: boolean;
}
