import { useCallback, useState } from 'react';

/** Open or closed, flipped by one handler: a result section's disclosure. */
export const useActionResultToggle = () => {
  const [isOpen, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((open) => !open), []);

  return { isOpen, toggle };
};

export const isBlankResultValue = (value: unknown) =>
  value === undefined || value === null || value === '';

export const formatResultJson = (value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);
