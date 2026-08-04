import {
  ISelectBoardsContext,
  ISelectPipelinesContext,
  ISelectStagesContext,
} from '../types';
import { createContext, useContext } from 'react';

export const SelectBoardsContext = createContext<ISelectBoardsContext | null>(
  null,
);

export const useSelectBoardsContext = () => {
  const context = useContext(SelectBoardsContext);
  if (!context) {
    throw new Error(
      'useSelectBoardsContext must be used within <SelectBoardsProvider>',
    );
  }
  return context;
};

export const SelectPipelinesContext =
  createContext<ISelectPipelinesContext | null>(null);

export const useSelectPipelinesContext = () => {
  const context = useContext(SelectPipelinesContext);
  if (!context) {
    throw new Error(
      'useSelectPipelinesContext must be used within <SelectPipelineProvider>',
    );
  }
  return context;
};

export const SelectStagesContext = createContext<ISelectStagesContext | null>(
  null,
);

export const useSelectStagesContext = () => {
  const context = useContext(SelectStagesContext);
  if (!context) {
    throw new Error(
      'useSelectStagesContext must be used within <SelectStageProvider>',
    );
  }
  return context;
};
