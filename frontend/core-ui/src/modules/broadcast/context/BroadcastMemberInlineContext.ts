import { AvatarProps } from 'erxes-ui';
import { createContext, useContext } from 'react';
import { IUser } from 'ui-modules';

export interface IBroadcastMemberInlineContext {
  members: IUser[];
  loading: boolean;
  memberIds?: string[];
  placeholder: string;
  size?: AvatarProps['size'];
  updateMembers?: (members: IUser[]) => void;
}

export const BroadcastMemberInlineContext =
  createContext<IBroadcastMemberInlineContext | null>(null);

export const useBroadcastMemberInlineContext = () => {
  const context = useContext(BroadcastMemberInlineContext);
  if (!context) {
    throw new Error(
      'useBroadcastMemberInlineContext must be used within a BroadcastMemberInlineProvider',
    );
  }
  return context;
};
