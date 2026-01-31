import { createContext, useContext } from 'react';

import { IStage } from '../types/stages';

export interface IStagesInlineContext {
  stages: IStage[];
  loading: boolean;
  stageIds?: string[];
  placeholder: string;
  updateStages?: (stages: IStage[]) => void;
}

export const StagesInlineContext = createContext<IStagesInlineContext | null>(
  null,
);

export const useStagesInlineContext = () => {
  const context = useContext(StagesInlineContext);
  if (!context) {
    throw new Error(
      'useStagesInlineContext must be used within a StagesInlineProvider',
    );
  }
  return context;
};
