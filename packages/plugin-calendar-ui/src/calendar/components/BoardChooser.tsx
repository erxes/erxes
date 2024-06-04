import { IBoard, IGroup } from "../types";
import { BoardChooser } from "./BoardChooser.1";

export type Props = {
  currentBoard?: IBoard;
  currentGroup?: IGroup;
  boards: IBoard[];
};

export const calendarLink = "/calendar";

export default BoardChooser;
