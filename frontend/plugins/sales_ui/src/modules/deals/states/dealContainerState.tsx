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

export const dealBoardState = atom<boardType>({} as boardType);
export const dealPipelineState = atom<pipelineType>({} as pipelineType);
export const dealStageState = atom<stageType>({} as stageType);
