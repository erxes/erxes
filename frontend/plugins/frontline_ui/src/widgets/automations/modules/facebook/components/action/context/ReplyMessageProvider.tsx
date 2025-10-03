import { createContext, useContext } from 'react';
import {
  Control,
  UseFormHandleSubmit,
  UseFormReturn,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';
import { INITIAL_OBJ_MESSAGE_TYPES } from '~/widgets/automations/modules/facebook/components/action/constants/ReplyMessage';
import {
  TBotMessage,
  TMessageActionForm,
} from '~/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm';
import { MessageActionTypeNames } from '~/widgets/automations/modules/facebook/components/action/types/messageActionForm';

interface ActionMessageContextType {
  messages: TBotMessage[];
  control: Control<TMessageActionForm>;
  watch: UseFormWatch<TMessageActionForm>;
  setValue: UseFormSetValue<TMessageActionForm>;
  setError: UseFormSetError<TMessageActionForm>;
  handleSubmit: UseFormHandleSubmit<TMessageActionForm>;
  addMessage: (type: MessageActionTypeNames) => void;
}

const ReplyMessageContext = createContext<ActionMessageContextType | null>(
  null,
);

export const ReplyMessageProvider = ({
  form,
  children,
}: {
  form: UseFormReturn<TMessageActionForm>;
  children: React.ReactNode;
}) => {
  const { control, watch, setValue, setError, handleSubmit } = form;

  const messages = watch('messages') || [];

  const addMessage = (type: MessageActionTypeNames) => {
    if (messages.length === 5) {
      return setError('messages', {
        message: 'You can only add up to 5 messages per action',
      });
    }

    const initialValues = INITIAL_OBJ_MESSAGE_TYPES[type];

    setValue('messages', [
      ...messages,
      { _id: generateAutomationElementId(), type, ...initialValues },
    ]);
  };

  return (
    <ReplyMessageContext.Provider
      value={{
        control,
        watch,
        setValue,
        setError,
        handleSubmit,
        addMessage,
        messages,
      }}
    >
      {children}
    </ReplyMessageContext.Provider>
  );
};

export const useReplyMessageAction = () => {
  const ctx = useContext(ReplyMessageContext);
  if (!ctx)
    throw new Error(
      'useReplyMessageAction must be used within ReplyMessageProvider',
    );
  return ctx;
};
