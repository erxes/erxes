import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Control,
  UseFormHandleSubmit,
  UseFormReturn,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';
import {
  INITIAL_OBJ_MESSAGE_TYPES,
  MAX_MESSAGES_PER_ACTION,
} from '~/widgets/automations/modules/facebook/components/action/constants/ReplyMessage';
import {
  TBotMessage,
  TMessageActionForm,
} from '~/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm';
import { MessageActionTypeNames } from '~/widgets/automations/modules/facebook/components/action/types/messageActionForm';

interface ActionMessageContextType {
  messages: TBotMessage[];
  maxMessages: number;
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
  maxMessages = MAX_MESSAGES_PER_ACTION,
  children,
}: {
  form: UseFormReturn<TMessageActionForm>;
  maxMessages?: number;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const { control, watch, setValue, setError, handleSubmit } = form;

  const messages = watch('messages') || [];

  const addMessage = (type: MessageActionTypeNames) => {
    if (messages.length >= maxMessages) {
      return setError('messages', {
        message:
          maxMessages === 1
            ? t(
                'single-message-comment-flow',
                'A comment reply can only send one message. Add a button and continue the flow in the next action.',
              )
            : t('max-five-messages'),
      });
    }

    const initialValues = INITIAL_OBJ_MESSAGE_TYPES[type];

    setValue('messages', [
      ...messages,
      {
        _id: generateAutomationElementId(),
        type,
        ...initialValues,
      } as TBotMessage,
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
        maxMessages,
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
