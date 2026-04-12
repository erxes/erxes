import { createContext, useContext } from 'react';

type TMessageTriggerFormContextValue = {
  activeConditionType: string;
  setActiveConditionType: (value: string) => void;
};

const MessageTriggerFormContext =
  createContext<TMessageTriggerFormContextValue | null>(null);

export const MessageTriggerFormProvider = MessageTriggerFormContext.Provider;

export const useMessageTriggerFormContext = () => {
  const context = useContext(MessageTriggerFormContext);

  if (!context) {
    throw new Error(
      'useMessageTriggerFormContext must be used within MessageTriggerFormProvider',
    );
  }

  return context;
};
