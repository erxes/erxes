import { IEmailSignature as IEmailSignatureC } from 'erxes-ui/lib/auth/types';

export type IEmailSignature = IEmailSignatureC;

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
