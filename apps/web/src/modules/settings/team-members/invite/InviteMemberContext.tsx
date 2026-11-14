import { createContext, useContext } from 'react';

export interface IUserInviteContext {
  selectedUsers: string[];
  setSelectedUsers: (selectedUsers: string[]) => void;
  fields: { id: string }[];
}

export const InviteMemberContext = createContext<IUserInviteContext>({
  selectedUsers: [],
  setSelectedUsers: () => undefined,
  fields: [],
});

export const useUserInviteContext = () => useContext(InviteMemberContext);
