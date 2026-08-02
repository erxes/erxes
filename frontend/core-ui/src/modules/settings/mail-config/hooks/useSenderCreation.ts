import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { useState } from 'react';

/**
 * Adding a sender is the same for every provider now that erxes sends the
 * confirmation itself: an address, plus the name recipients will see. Both the
 * sender manager and the automation picker offer this, so it lives here rather
 * than being written twice.
 */
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
