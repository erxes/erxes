export interface ITag {
  _id: string;
  type: string;
  name: string;
  colorCode: string;
  objectCount?: number;
}

export interface ITagSaveDoc {
  name: string;
  type: string;
  colorCode: string;
}