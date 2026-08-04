import { atom } from 'jotai';

interface boardType {
  boardId: string;
}
interface pipelineType {
  pipelineId: string;
}
interface stageType {
  stageId: string;
}

export const dealBoardState = atom<boardType | null>(null);
export const dealPipelineState = atom<pipelineType | null>(null);
export const dealStageState = atom<stageType | null>(null);
