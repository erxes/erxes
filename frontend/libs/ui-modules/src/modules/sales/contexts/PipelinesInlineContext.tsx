import { createContext, useContext } from 'react';

import { IPipeline } from '../types';

export interface IPipelinesInlineContext {
  pipelines: IPipeline[];
  loading: boolean;
  pipelineIds?: string[];
  placeholder: string;
  updatePipelines?: (pipelines: IPipeline[]) => void;
}

export const PipelinesInlineContext =
  createContext<IPipelinesInlineContext | null>(null);

export const usePipelinesInlineContext = () => {
  const context = useContext(PipelinesInlineContext);
  if (!context) {
    throw new Error(
      'usePipelinesInlineContext must be used within a PipelinesInlineProvider',
    );
  }
  return context;
};
