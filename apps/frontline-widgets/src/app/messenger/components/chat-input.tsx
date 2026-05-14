import { FC, useId } from 'react';
import { IconArrowUp } from '@tabler/icons-react';
import { Button, Input, cn, toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { InitialMessage } from '../constants';
import { connectionAtom } from '../states';
import { useCustomerData } from '../hooks/useCustomerData';
import { useChatInput } from '../hooks/useChatInput';
import { PersistentMenu } from './persistent-menu';

interface ChatInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ChatInput: FC<ChatInputProps> = ({ className, ...inputProps }) => {
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect || {};
  const { messages, isOnline, requireAuth, showChat } = messengerData || {};
  const placeholder = isOnline
    ? InitialMessage.WELCOME
    : messages?.away || InitialMessage.AWAY;
  const id = useId();
  const { message, handleInputChange, handleSubmit, isDisabled, loading } =
    useChatInput();
  const { hasEmailOrPhone } = useCustomerData();
  const shouldDisable = requireAuth === true && !hasEmailOrPhone;

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
          disabled={shouldDisable}
          onChange={handleInputChange}
          {...inputProps}
        />
        <Button
          size="icon"
          type="submit"
          aria-label="Send"
          className="aspect-square text-accent bg-primary size-8 p-2"
          disabled={isDisabled || loading || shouldDisable}
        >
          <IconArrowUp />
        </Button>
        <PersistentMenu />
      </div>
    </form>
  );
};
