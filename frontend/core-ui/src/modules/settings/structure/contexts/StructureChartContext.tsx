import { Icon } from '@tabler/icons-react';
import { createContext, useContext } from 'react';
import { TStructureCreateTarget } from '../states/structureCreateState';

export type TStructureChartContext = {
  canEdit: boolean;
  editMode: boolean;
  // Edit mode for a user who can edit: "+" buttons and placeholders render
  showActions: boolean;
  nodeIcon: Icon;
  toggleCollapse: (id: string) => void;
  toggleEditMode: () => void;
  expandAll: () => void;
  collapseAll: () => void;
  openCreate: (target: TStructureCreateTarget) => void;
};

export const StructureChartContext =
  createContext<TStructureChartContext | null>(null);

export const useStructureChartContext = () => {
  const context = useContext(StructureChartContext);

  if (!context) {
    throw new Error(
      'useStructureChartContext must be used within StructureChartContext',
    );
  }

  return context;
};
