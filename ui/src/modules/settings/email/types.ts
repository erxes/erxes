export interface IEmailSignature {
  brandId?: string;
  signature?: string;
}

export interface IEmailSignatureWithBrand extends IEmailSignature {
  brandName?: string;
}

// mutations

export type UsersConfigEmailSignaturesMutationVariables = {
  signatures: IEmailSignature[];
};

export type UsersConfigEmailSignaturesMutationResponse = {
  saveMutation: (params: {
    variables: UsersConfigEmailSignaturesMutationVariables;
  }) => Promise<void>;
};
