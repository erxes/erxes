export interface ITag {
  _id: string;
  type: string;
  name: string;
  colorCode: string;
  objectCount?: number;
}

export interface ITagSaveParams {
  tag?: ITag;
  doc: {
    _id?: string;
    name: string;
    type: string;
    colorCode: string;
  };
  callback: () => void;
}

export type ITagTypes = 'conversation' | 'customer'  | 'engageMessage' | 'company' | 'integration';