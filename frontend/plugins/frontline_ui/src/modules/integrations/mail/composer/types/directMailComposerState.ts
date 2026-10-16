import type {
  ComposeEmailTarget,
  ComposerAttachment,
  ComposeValues,
  MailSender,
} from '@/integrations/mail/composer/types/directMailComposer';
import type { DirectMailComposerFieldsState } from '@/integrations/mail/composer/types/directMailComposerFields';
import type {
  useMailMessageRetry,
  useMailSendMail,
} from '@/integrations/mail/hooks/useMailConversationDetail';
import type { MailDeliveryOutcome } from '@/integrations/mail/types/mailDelivery';
import type { ApolloError, QueryResult } from '@apollo/client';
import type { IBlockEditor } from 'erxes-ui';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { FrontlineMailSendersQuery } from '~/gql/graphql';

export interface DirectMailComposerState {
  canComposeEmail: boolean;
  target: ComposeEmailTarget | null;
  form: UseFormReturn<ComposeValues>;
  editor: IBlockEditor;
  minimized: boolean;
  setMinimized: Dispatch<SetStateAction<boolean>>;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  sending: boolean;
  failedDelivery?: MailDeliveryOutcome;
  fieldActions: DirectMailComposerFieldsState;
  close: () => void;
  handleBodyChange: () => void;
  submit: (values: ComposeValues) => Promise<void>;
  sendersLoading: boolean;
  selectedSender?: MailSender;
  sendersError?: ApolloError;
  senders: MailSender[];
  handleRetry: () => void;
  setRecipientCustomerId: Dispatch<SetStateAction<string | undefined>>;
  attachments: ComposerAttachment[];
  setAttachments: Dispatch<SetStateAction<ComposerAttachment[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
}

export interface DirectMailComposerStore
  extends Omit<
    DirectMailComposerState,
    'close' | 'handleBodyChange' | 'submit' | 'handleRetry'
  > {
  recipientCustomerId?: string;
  showCc: boolean;
  showBcc: boolean;
  setTarget: Dispatch<SetStateAction<ComposeEmailTarget | null>>;
  setFailedDelivery: Dispatch<SetStateAction<MailDeliveryOutcome | undefined>>;
  setShowCc: Dispatch<SetStateAction<boolean>>;
  setShowBcc: Dispatch<SetStateAction<boolean>>;
  integrationId: string;
  refetch: QueryResult<FrontlineMailSendersQuery>['refetch'];
  mailSendMail: ReturnType<typeof useMailSendMail>['mailSendMail'];
  mailMessageRetry: ReturnType<typeof useMailMessageRetry>['mailMessageRetry'];
}
