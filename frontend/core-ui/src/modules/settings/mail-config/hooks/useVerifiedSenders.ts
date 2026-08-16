import {
  REMOVE_VERIFIED_SENDER,
  SENDER_OPTIONS,
  VERIFY_SENDER,
} from '@/settings/mail-config/graphql/verifiedSenders';
import { useEmailSenderScope } from '@/settings/mail-config/contexts/EmailSenderScope';
import { OperationVariables, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';

export type TEmailProvider = 'SES' | 'sendgrid' | 'custom';

export interface IEmailSender {
  id: string;
  type: 'single' | 'domain';
  value: string;
  name?: string;
  status: 'pending' | 'verified' | 'failed';
}

export interface IEmailSenderOptions {
  provider: TEmailProvider;
  supportsSenderVerification: boolean;
  supportsDynamicSender: boolean;
  defaultSenderEmail: string;
  alignedFrom: string | null;
  sameAsMailConfig: boolean;
  senders: IEmailSender[];
}

export interface IVerifySenderInput {
  email: string;
  name?: string;
}

const EMPTY_OPTIONS: IEmailSenderOptions = {
  provider: 'SES',
  supportsSenderVerification: false,
  supportsDynamicSender: false,
  defaultSenderEmail: '',
  alignedFrom: null,
  sameAsMailConfig: false,
  senders: [],
};

export const useSenderOptions = () => {
  const scope = useEmailSenderScope();

  const { data, loading, error } = useQuery<{
    emailSenderOptions: IEmailSenderOptions;
  }>(SENDER_OPTIONS, { variables: { scope } });

  const options = data?.emailSenderOptions || EMPTY_OPTIONS;

  return {
    ...options,
    singleSenders: (options.senders || []).filter(
      (sender) => sender.type === 'single',
    ),
    loading,
    error,
  };
};

export const useVerifySender = () => {
  const scope = useEmailSenderScope();
  const [_verifySender, { loading }] = useMutation(VERIFY_SENDER);

  const verifySender = async (
    input: IVerifySenderInput,
    options?: OperationVariables,
  ) => {
    await _verifySender({
      ...options,
      variables: { ...input, scope },
      refetchQueries: [SENDER_OPTIONS],
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { verifySender, loading };
};

export const useRemoveVerifiedSender = () => {
  const scope = useEmailSenderScope();
  const [_removeVerifiedSender, { loading }] = useMutation(
    REMOVE_VERIFIED_SENDER,
  );

  const removeVerifiedSender = async (
    email: string,
    options?: OperationVariables,
  ) => {
    await _removeVerifiedSender({
      ...options,
      variables: { email, scope },
      refetchQueries: [SENDER_OPTIONS],
      onCompleted: () => {
        toast({
          title: 'Sender removed successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { removeVerifiedSender, loading };
};
