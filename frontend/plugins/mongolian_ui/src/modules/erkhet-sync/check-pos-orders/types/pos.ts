export interface IPos {
  _id: string;
  name?: string | null;
  code?: string;
}
export interface PosInlineProps {
  posIds?: string[];
  pos?: IPos[];
  placeholder?: string;
  updatePos?: (pos: IPos[]) => void;
}

export const toPos = (pos: {
  _id: string | null;
  name: string | null;
}): IPos[] => (pos._id ? [{ _id: pos._id, name: pos.name }] : []);
