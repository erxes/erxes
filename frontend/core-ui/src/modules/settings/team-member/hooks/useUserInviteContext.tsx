import { useContext } from 'react';
import {
  InviteMemberRowContext,
  InviteMemberContext,
} from '../context/InviteMemberContext';

export const useUserInviteRowContext = () => {
  return useContext(InviteMemberRowContext);
};

export const useUserInviteContext = () => {
  return useContext(InviteMemberContext);
};
