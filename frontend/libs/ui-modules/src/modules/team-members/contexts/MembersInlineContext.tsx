import { createContext, useContext } from 'react';
import { AvatarProps } from 'erxes-ui';
import { IUser } from '../types/TeamMembers';

export interface IUsersInlineContext {
  members: IUser[];
  loading: boolean;
  memberIds?: string[];
  placeholder: string;
  size?: AvatarProps['size'];
  updateMembers?: (members: IUser[]) => void;
  allowUnassigned?: boolean;
}

export const MembersInlineContext = createContext<IUsersInlineContext | null>(
  null,
);

export const useMembersInlineContext = () => {
  const context = useContext(MembersInlineContext);
  if (!context) {
    throw new Error(
      'useMembersInlineContext must be used within a MembersInlineProvider',
    );
  }
  return context;
};
