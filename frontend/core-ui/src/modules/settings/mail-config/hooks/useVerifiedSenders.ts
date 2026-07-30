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
  /** `single` is one verified address; `domain` lets any address below it send. */
  type: 'single' | 'domain';
  value: string;
  name?: string;
  status: 'pending' | 'verified' | 'failed';
}

export interface IEmailSenderOptions {
  provider: TEmailProvider;
  supportsSenderVerification: boolean;
  /** True when a free-form "from" address can actually be delivered. */
  supportsDynamicSender: boolean;
  /** What the "company email" sender option resolves to, as the server sees it. */
  defaultSenderEmail: string;
  /** True when this scope ends up on the very same credentials as mail config. */
  sameAsMailConfig: boolean;
  senders: IEmailSender[];
}

export interface IVerifySenderInput {
  email: string;
  name?: string;
  replyTo?: string;
}

const EMPTY_OPTIONS: IEmailSenderOptions = {
  provider: 'SES',
  supportsSenderVerification: false,
  supportsDynamicSender: false,
  defaultSenderEmail: '',
  sameAsMailConfig: false,
  senders: [],
};

/**
 * Everything the sender pickers need, in one request. The rules behind these
 * flags — which providers keep a sender registry, what "company email" resolves
 * to, whether a free-form address can be delivered — are decided server-side,
 * next to the send path that enforces them, so the UI cannot drift into
 * offering a sender the backend would refuse.
 */
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
