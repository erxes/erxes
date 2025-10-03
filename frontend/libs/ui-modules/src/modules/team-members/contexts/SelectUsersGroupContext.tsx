import { IUserGroupContext } from '../types/TeamMembers';
import { createContext } from 'react';

export const SelectUsersGroupContext = createContext<IUserGroupContext>(
  {} as IUserGroupContext,
);
