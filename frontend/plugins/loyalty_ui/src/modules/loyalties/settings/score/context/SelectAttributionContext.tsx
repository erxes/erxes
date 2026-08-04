import { createContext, useContext, Dispatch, SetStateAction } from 'react';

import { IAttribution } from '../types/attributionType';

export type ISelectAttributionContext = {
  attributionIds: string[];
  onSelect: (member: IAttribution | null) => void;
  members: IAttribution[];
  setMembers: Dispatch<SetStateAction<IAttribution[]>>;
  loading: boolean;
  allowUnassigned: boolean;
};

export const SelectAttributionContext =
  createContext<ISelectAttributionContext | null>(null);

export const useSelectAttributionContext = () => {
  const context = useContext(SelectAttributionContext);
  if (!context) {
    throw new Error(
      'useSelectAttributionContext must be used within a SelectAttributionProvider',
    );
  }
  return context;
};
