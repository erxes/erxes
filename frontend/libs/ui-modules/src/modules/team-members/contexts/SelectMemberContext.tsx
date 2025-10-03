import { createContext, useContext } from 'react';

import { IUser } from '../types/TeamMembers';

export type ISelectMemberContext = {
  memberIds: string[];
  onSelect: (member: IUser | null) => void;
  members: IUser[];
  setMembers: (members: IUser[]) => void;
  loading: boolean;
  allowUnassigned: boolean;
};

export const SelectMemberContext = createContext<ISelectMemberContext | null>(
  null,
);

export const useSelectMemberContext = () => {
  const context = useContext(SelectMemberContext);
  if (!context) {
    throw new Error(
      'useSelectMemberContext must be used within a SelectMemberProvider',
    );
  }
  return context;
};
