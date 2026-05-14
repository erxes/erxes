import { IPipeline } from "./pipelines";

export interface IBoard {
  _id: string;
  name: string;
  pipelines?: IPipeline[];
}
  
export interface ISelectBoardsContext {
  boardIds: string[];
  boards: IBoard[];
  setBoards: (boards: IBoard[]) => void;
  onSelect: (board: IBoard) => void;
  loading: boolean;
  error: string | null;
  newBoardName?: string;
  setNewBoardName?: (name: string) => void;
}

export interface BoardsInlineProps {
  boardIds?: string[];
  boards?: IBoard[];
  placeholder?: string;
  updateBoards?: (boards: IBoard[]) => void;
}

