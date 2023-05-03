import { IUser } from '@erxes/ui/src/auth/types';

export type IUserCall = IUser & {
  time: string;
  isMissedCall: boolean;
};
