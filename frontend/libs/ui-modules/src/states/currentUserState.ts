import { IUser } from 'ui-modules/modules/team-members/types/TeamMembers';
import { atom } from 'jotai';

export const currentUserState = atom<IUser | null>(null);
