export type IInternalNote = {
  _id: string;
  content: string;
};

export type InternalNotesAddMutationVariables = {
  contentType: string;
  contentTypeId: string;
  content: string;
  mentionedUserIds: string[];
};

export type InternalNotesAddMutationResponse = {
  internalNotesAdd: (
    params: {
      variables: InternalNotesAddMutationVariables;
    }
  ) => Promise<any>;
};

export type InternalNoteDetailQueryResponse = {
  internalNoteDetail: IInternalNote;
  loading: boolean;
  refetch: () => void;
};
