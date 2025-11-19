import { FC, useId } from 'react';
import { IconArrowUp } from '@tabler/icons-react';
import { Button, Input, cn } from 'erxes-ui';
import { useChatInput } from '../hooks/useChatInput';
import { useAtom } from 'jotai';
import { InitialMessage } from '../constants';
import { connectionAtom } from '../states';

interface ChatInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ChatInput: FC<ChatInputProps> = ({ className, ...inputProps }) => {
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect || {};
  const { messages, isOnline } = messengerData || {};
  const placeholder = isOnline
    ? messages?.welcome || InitialMessage.WELCOME
    : messages?.away || InitialMessage.AWAY;
  const id = useId();
  const { message, handleInputChange, handleSubmit, isDisabled, loading } =
    useChatInput();

  return (
    <form
      className="p-4 flex grow-0 shrink-0"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div className="flex items-center gap-2 w-full">
        <Input
          id={id}
          className={cn(
            'border-none h-9 shadow-none placeholder:text-muted-foreground placeholder:font-medium placeholder:text-sm',
            className,
          )}
          placeholder={placeholder}
          value={message}
          onChange={handleInputChange}
          {...inputProps}
        />
        <Button
          size="icon"
          type="submit"
          aria-label="Send"
          className="aspect-square text-accent bg-(--primary) size-8 p-2"
          disabled={isDisabled || loading}
        >
          <IconArrowUp />
        </Button>
      </div>
    </form>
  );
};
