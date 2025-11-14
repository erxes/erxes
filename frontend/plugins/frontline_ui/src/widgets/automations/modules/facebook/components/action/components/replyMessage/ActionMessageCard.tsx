import { IconChevronDown, IconLink } from '@tabler/icons-react';
import { Button, Collapsible, readImage } from 'erxes-ui';
import { Link } from 'react-router';
import { useState } from 'react';
import { REPLY_MESSAGE_ACTION_BUTTONS } from '../../constants/ReplyMessage';
import { TAutomationAction } from 'ui-modules';
import { TMessageActionForm } from '../../states/replyMessageActionForm';
import { useAutomationOptionalConnect } from 'ui-modules';

interface MessageButton {
  _id: string;
  text: string;
  link?: string;
  image_url?: string;
  type?: 'button' | 'link';
}

interface ActionMessageCardProps {
  _id: string;
  type: string;
  actionData: TAutomationAction<TMessageActionForm>;
  text?: string;
  title?: string;
  subtitle?: string;
  buttons?: MessageButton[];
}

function MessageButtonItem({
  button,
  actionId,
}: {
  button: MessageButton;
  actionId: string;
}) {
  const OptionConnectHandle = useAutomationOptionalConnect({
    id: actionId,
  });

  return (
    <div className="relative bg-background shadow text-xs font-semibold rounded-xs m-2 p-2 text-mono">
      {button.image_url && (
        <img
          className="w-6 h-6 rounded-full mr-2"
          src={readImage(button.image_url)}
          alt={button.image_url}
        />
      )}
      <div className="flex items-center justify-between">
        {button.text}
        {button.link ? (
          <Link to={button.link} target="_blank">
            <IconLink className="size-4" />
          </Link>
        ) : (
          <OptionConnectHandle optionalId={button._id} />
        )}
      </div>
    </div>
  );
}

function CollapsibleContent({
  text,
  title,
  subtitle,
}: {
  text?: string;
  title?: string;
  subtitle?: string;
}) {
  const content = text || title;
  if (!content && !subtitle) return null;

  return (
    <Collapsible.Content className="px-6">
      {content && <p>{content}</p>}
      {subtitle && <span>{subtitle}</span>}
    </Collapsible.Content>
  );
}

function CollapsibleTrigger({
  type,
  text,
  isOpen,
}: {
  type: string;
  text?: string;
  isOpen: boolean;
}) {
  const { title: actionButtonTitle, icon: ActionButtonIcon } =
    REPLY_MESSAGE_ACTION_BUTTONS.find(
      ({ type: btnType }) => btnType === type,
    ) || {};

  const displayText = !isOpen && text ? text.slice(0, 20) : actionButtonTitle;

  return (
    <Collapsible.Trigger asChild>
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2 items-center">
          {ActionButtonIcon && <ActionButtonIcon />}
          {displayText}
        </div>
        <IconChevronDown />
      </Button>
    </Collapsible.Trigger>
  );
}

export function ActionMessageCard({
  _id,
  type,
  actionData,
  text,
  title,
  subtitle,
  buttons = [],
}: ActionMessageCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div onClick={handleClick}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} onClick={handleClick}>
        <CollapsibleTrigger type={type} text={text || title} isOpen={isOpen} />
        <CollapsibleContent text={text} title={title} subtitle={subtitle} />
      </Collapsible>
      {buttons.map((button) => (
        <MessageButtonItem
          key={`${button._id}-button`}
          button={button}
          actionId={actionData.id}
        />
      ))}
    </div>
  );
}
