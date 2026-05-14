export interface IPos {
  _id: string;
  name?: string;
}
export interface PosInlineProps {
  posIds?: string[];
  pos?: IPos[];
  placeholder?: string;
  updatePos?: (pos: IPos[]) => void;
}
