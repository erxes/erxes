export interface IPos {
  _id: string;
  name?: string;
  code?: string;
}
export interface PosInlineProps {
  posIds?: string[];
  pos?: IPos[];
  placeholder?: string;
  updatePos?: (pos: IPos[]) => void;
}
