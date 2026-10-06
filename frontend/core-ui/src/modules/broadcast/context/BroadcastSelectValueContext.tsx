import { SelectTriggerVariant } from 'erxes-ui';
import React, { createContext, useContext } from 'react';

interface IBroadcastSelectValueContext {
  value?: string;
  onValueChange: (value: string) => void;
  variant?: `${SelectTriggerVariant}`;
}

const BroadcastSelectValueContext =
  createContext<IBroadcastSelectValueContext | null>(null);

export const useBroadcastSelectValue = () => {
  const context = useContext(BroadcastSelectValueContext);

  if (!context) {
    throw new Error(
      'useBroadcastSelectValue must be used within a BroadcastSelectValueProvider',
    );
  }

  return context;
};

/**
 * One chosen value, shared down a select's own parts.
 *
 * The method picker and the status picker are the same control over different
 * options, and each carried its own copy of this — identically written, both
 * named after a status field in another module they were copied from. One
 * definition is what keeps the two pickers behaving alike.
 */
export const BroadcastSelectValueProvider = ({
  children,
  value,
  onValueChange,
  variant,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  variant?: `${SelectTriggerVariant}`;
}) => {
  // Clearing is done by picking again, never by handing back an empty value.
  const handleValueChange = (next: string) => {
    if (!next) {
      return;
    }

    onValueChange(next);
  };

  return (
    <BroadcastSelectValueContext.Provider
      value={{ value, onValueChange: handleValueChange, variant }}
    >
      {children}
    </BroadcastSelectValueContext.Provider>
  );
};
