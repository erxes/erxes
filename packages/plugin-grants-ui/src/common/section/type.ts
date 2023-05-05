import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type IGrantRequest = {
  cardId: string;
  cardType: string;
  userIds: string[];
  users: IUser[];
  action: string;
};

export type RequestQueryResponse = {
  grantRequest: IGrantRequest;
} & QueryResponse;
