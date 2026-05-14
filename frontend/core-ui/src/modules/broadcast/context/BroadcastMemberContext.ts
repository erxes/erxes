import { createContext, useContext } from 'react';
import { IUser } from 'ui-modules';

export type IBroadcastMemberContext = {
  memberIds: string[];
  onSelect: (member: IUser | null) => void;
  members: IUser[];
  setMembers: (members: IUser[]) => void;
  loading: boolean;
  variables: any;
};

export const BroadcastMemberContext =
  createContext<IBroadcastMemberContext | null>(null);

export const useBroadcastMemberContext = () => {
  const context = useContext(BroadcastMemberContext);
  if (!context) {
    throw new Error(
      'useBroadcastMemberContext must be used within a BroadcastMemberProvider',
    );
  }
  return context;
};
