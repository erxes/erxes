import { IUser } from '../auth/types';
import { QueryResponse } from '../types';

export type SyncConfigMutationResponse = ({ variables: any }) => Promise<any>;

export type SyncOrdersMutationResponse = () => Promise<any>;

export type DeleteOrdersMutationResponse = () => Promise<any>;

export type PosUsersQueryResponse = {
  posUsers: IUser[];
} & QueryResponse;
