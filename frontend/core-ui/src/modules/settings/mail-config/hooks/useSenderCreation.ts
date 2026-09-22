import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { useState } from 'react';

export const useSenderCreation = () => {
  const { provider } = useSenderOptions();
  const [formOpen, setFormOpen] = useState(false);

  return {
    provider,
    formOpen,
    setFormOpen,
    openForm: () => setFormOpen(true),
  };
};
