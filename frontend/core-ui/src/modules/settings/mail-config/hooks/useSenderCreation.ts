import {
  useSenderOptions,
  useVerifySender,
} from '@/settings/mail-config/hooks/useVerifiedSenders';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import validator from 'validator';

/**
 * Adding a sender differs by provider: SES needs nothing but the address, while
 * SendGrid also stores a name and postal address, so it gets a form. Both the
 * sender manager and the automation picker offer this, so the behaviour lives
 * here rather than being written twice.
 */
export const useSenderCreation = () => {
  const { provider } = useSenderOptions();
  const { verifySender, loading } = useVerifySender();
  const [sendgridFormOpen, setSendgridFormOpen] = useState(false);

  const needsForm = provider === 'sendgrid';

  const addByEmail = (email: string, onDone?: () => void) => {
    if (!validator.isEmail(email)) {
      return toast({
        title: 'Invalid email',
        description: 'Please enter a valid email',
        variant: 'destructive',
      });
    }

    verifySender(
      { email },
      {
        onCompleted: () => {
          toast({
            title: 'Verification sent',
            description: `Ask the owner of ${email} to open the confirmation link.`,
            variant: 'success',
          });

          onDone?.();
        },
      },
    );
  };

  return {
    provider,
    needsForm,
    addByEmail,
    loading,
    sendgridFormOpen,
    setSendgridFormOpen,
    openSendgridForm: () => setSendgridFormOpen(true),
  };
};
