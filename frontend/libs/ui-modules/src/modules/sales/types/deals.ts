import { IPipeline } from './pipelines';

export interface IItem {
  _id: string;
  boardId?: string;
  pipeline: IPipeline;
  stageId?: string;
}

export interface IDeal extends IItem {}
