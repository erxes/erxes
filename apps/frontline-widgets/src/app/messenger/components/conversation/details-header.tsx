import { useState } from 'react';
import { Avatar, Button, readImage } from 'erxes-ui';
import {
  IconArrowLeft,
  IconArrowsDiagonal2,
  IconArrowsDiagonalMinimize,
  IconSparkles,
} from '@tabler/icons-react';
import { useMessenger } from '../../hooks/useMessenger';
import { CloseButton } from '../CloseButton';

type ConversationDetailsHeaderProps = {
  agentName: string;
  agentAvatar?: string;
  isLastMessageFromBot: boolean;
  isOnline?: boolean;
  aiAgentLabel?: string;
  subtitle: string;
  onBack: () => void;
};

export function ConversationDetailsHeader({
  agentName,
  agentAvatar,
  isLastMessageFromBot,
  isOnline,
  aiAgentLabel,
  subtitle,
  onBack,
}: ConversationDetailsHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-(--color-hero) shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="text-primary-foreground rounded-2xl hover:bg-primary-foreground/10 size-8 shrink-0"
        aria-label="Back to conversations"
      >
        <IconArrowLeft className="size-4" />
      </Button>
      <div className="relative shrink-0">
        {isLastMessageFromBot ? (
          <div className="size-9 border-[0.5px] border-primary backdrop-blur-md rounded-lg bg-linear-120 from-primary to-primary-foreground/20 flex items-center justify-center">
            <IconSparkles className="size-5 text-primary-foreground" />
          </div>
        ) : (
          <Avatar className="size-9">
            {agentAvatar && (
              <Avatar.Image
                src={readImage(agentAvatar)}
                alt={agentName}
                className="object-cover"
              />
            )}
            <Avatar.Fallback className="bg-primary-foreground/20 text-primary-foreground font-semibold text-sm">
              {agentName.charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
        )}
        {isOnline && !isLastMessageFromBot && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-primary-foreground font-semibold text-sm flex items-center gap-1.5 truncate">
          {isLastMessageFromBot ? (
            <>
              {aiAgentLabel}
              <span className="inline-flex items-center rounded-sm px-1.5 text-xs font-medium h-5 bg-primary/20 text-primary-foreground border border-primary/30 shrink-0">
                AI
              </span>
            </>
          ) : (
            agentName
          )}
        </div>
        <div className="text-primary-foreground/60 text-xs truncate flex items-center gap-1">
          {isLastMessageFromBot ? 'Automated · replies instantly' : subtitle}
        </div>
      </div>
      <span className="flex items-center">
        <ConversationDetailsDropdown />
        <CloseButton />
      </span>
    </div>
  );
}

const ConversationDetailsDropdown = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { resetExpand, expandWindow } = useMessenger();
  const handleExpanded = () => {
    if (expanded) {
      resetExpand();
    } else {
      expandWindow();
    }
    setExpanded(!expanded);
  };
  return (
    <button
      onClick={handleExpanded}
      className="text-primary-foreground hover:bg-primary-foreground/10 size-8 rounded-xl shrink-0 flex items-center justify-center cursor-pointer"
      aria-label={expanded ? 'Collapse messenger' : 'Expand messenger'}
    >
      {expanded ? (
        <IconArrowsDiagonalMinimize className="size-4" />
      ) : (
        <IconArrowsDiagonal2 className="size-4" />
      )}
    </button>
  );
};
