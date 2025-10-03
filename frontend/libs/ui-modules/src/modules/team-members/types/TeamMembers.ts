import { SlashMenuProps } from 'erxes-ui';

export interface IUser {
  _id: string;
  email?: string;
  username?: string;
  isOwner?: boolean;
  details?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatar?: string;
  };
}
export interface IUserGroup {
  _id: string;
  name: string;
  description: string;
  members?: IUser[];
  memberIds?: string[];
}

export interface IUserGroupContext {
  groupsIds: string[];
  onSelect: (group: IUserGroup) => void;
  usersGroups: IUserGroup[];
  setUsersGroups: (usersGroups: IUserGroup[]) => void;
  loading: boolean;
  error: string | null;
}

export interface MentionMenuProps extends SlashMenuProps {
  loading: boolean;
  users: IUser[];
  handleFetchMore: () => void;
  totalCount: number;
}
