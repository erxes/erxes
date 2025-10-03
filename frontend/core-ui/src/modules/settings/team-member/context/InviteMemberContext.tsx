import { createContext } from 'react';
import { IInviteUserRowContext, IUserInviteContext } from '../types';

export const InviteMemberRowContext = createContext<IInviteUserRowContext>(
  {} as IInviteUserRowContext,
);

export const InviteMemberContext = createContext<IUserInviteContext>(
  {} as IUserInviteContext,
);
