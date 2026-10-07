import { createContext, useContext } from 'react';
import type {
  ComposeMode,
  MailMessage,
} from '@/integrations/mail/types/mailThread';

interface MailThreadActions {
  readOnly?: boolean;
  onNewEmail?: (email: string) => void;
  open: (message: MailMessage, mode: ComposeMode) => void;
}

export const MailThreadActionsContext = createContext<MailThreadActions | null>(
  null,
);

export const useMailThreadActions = () => {
  const actions = useContext(MailThreadActionsContext);
  if (!actions) {
    throw new Error('Mail thread actions must be used within MailThread');
  }
  return actions;
};
