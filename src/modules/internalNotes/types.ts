export type InternalNotesAddMutationVariables = {
  contentType: string;
  contentTypeId: string;
  content: string;
};

export type InternalNotesAddMutationResponse = {
  internalNotesAdd: (
    params: {
      variables: InternalNotesAddMutationVariables;
    }
  ) => Promise<any>;
};
