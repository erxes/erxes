import { createContext, useContext } from 'react';
import {
  IStructureEntityTypeDetail,
  TStructureTreeEntity,
} from '../types/structureEntity';

export type TStructureWorkspaceContext = {
  entities: TStructureTreeEntity[];
  entitiesById: Map<string, TStructureTreeEntity>;
  childrenById: Map<string, TStructureTreeEntity[]>;
  types: IStructureEntityTypeDetail[];
  typesById: Map<string, IStructureEntityTypeDetail>;
  selectedId: string | null;
  select: (id: string, options?: { focus?: boolean }) => void;
  isExpanded: (entity: TStructureTreeEntity, depth: number) => boolean;
  toggle: (id: string, expanded: boolean) => void;
  expand: (id: string) => void;
  startDraft: (parentId: string) => void;
  canManage: boolean;
  canManageTypes: boolean;
};

export const StructureWorkspaceContext =
  createContext<TStructureWorkspaceContext | null>(null);

export const useStructureWorkspace = () => {
  const context = useContext(StructureWorkspaceContext);

  if (!context) {
    throw new Error(
      'useStructureWorkspace must be used within StructureWorkspaceContext',
    );
  }

  return context;
};
