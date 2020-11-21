import { IUser } from 'modules/auth/types';

export type IInternalNote = {
  _id: string;
  content: string;
  createdUser: IUser;
  createdAt: Date;
};

export type InternalNotesEditMutationVariables = {
  _id: string;
  content: string;
  mentionedUserIds: string[];
};

export type InternalNotesAddMutationVariables = {
  contentType: string;
  contentTypeId: string;
  content: string;
  mentionedUserIds: string[];
};

export type InternalNotesEditMutationResponse = ({
  variables: InternalNotesEditMutationVariables
}) => Promise<any>;

export type InternalNotesAddMutationResponse = {
  internalNotesAdd: (params: {
    variables: InternalNotesAddMutationVariables;
  }) => Promise<any>;
};

export type InternalNotesRemoveMutationResponse = {
  internalNotesRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

export type InternalNoteDetailQueryResponse = {
  internalNoteDetail: IInternalNote;
  loading: boolean;
  refetch: () => void;
  subscribeToMore: any;
};
