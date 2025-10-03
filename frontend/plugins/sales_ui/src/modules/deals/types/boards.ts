import { BOARD_CREATE_SCHEMA } from "@/deals/schemas/boardFormSchema";
import { IPipeline } from "@/deals/types/pipelines";
import { z } from "zod";

export interface IBoard {
    _id: string;
    name: string;
    pipelines?: IPipeline[];
  }
  
export interface IBoardCount {
    _id: string;
    name: string;
    count: number;
}     

export type TBoardForm = z.infer<typeof BOARD_CREATE_SCHEMA>;
