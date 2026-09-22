import {
  Avatar,
  Badge,
  Button,
  Collapsible,
  Label,
  Separator,
  Skeleton,
  cn,
} from 'erxes-ui';
import {
  IconCheck,
  IconChevronDown,
  IconRobotFace,
  IconSettings,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useFacebookBotHealthCell } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotHealthCell';

import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { useFacebookBots } from '@/integrations/facebook/hooks/useFacebookBots';

type Props = {
  onSelect: (id: string) => void;
  botId?: string;
};

const getPageName = (bot?: IFacebookBot) =>
  (bot?.page as { name?: string })?.name || '';

export const FacebookBotSelector = ({ botId, onSelect }: Props) => {
  const { t } = useTranslation('frontline');
  const [selectedBotId, setBotId] = useState(botId || '');
  const [isOpen, setOpen] = useState(!botId || false);

  const { bots, loading } = useFacebookBots();
  const selectedBot = bots.find(
    (bot: IFacebookBot) => bot._id === selectedBotId,
  );

  if (loading) {
    return <MessengerBotSelectorSkeleton />;
  }

  const handleSelect = (_id: string) => {
    setOpen(false);
    setBotId(_id);
    onSelect(_id);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <div className="flex w-full cursor-pointer flex-row items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-row items-center gap-3">
            <Avatar className="size-8">
              <Avatar.Image
                src={selectedBot?.profileUrl || '/images/erxes-bot.svg'}
              />
              <Avatar.Fallback>
                {(selectedBot?.name || '').charAt(0)}
              </Avatar.Fallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <Label className="truncate text-base">
                {selectedBot?.name || t('select-a-bot', 'Select a bot')}
              </Label>
              {/* A bot is the page it answers for; the name alone does not say. */}
              {selectedBot && (
                <span className="truncate text-xs text-muted-foreground">
                  {getPageName(selectedBot)}
                </span>
              )}
            </div>
          </div>
          <IconChevronDown className="size-4 shrink-0" />
        </div>
      </Collapsible.Trigger>
      <Separator />
      <Collapsible.Content className="p-4">
        <MessengerBotList
          bots={bots}
          selectedBotId={selectedBotId}
          handleSelect={handleSelect}
        />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const MessengerBotSelectorSkeleton = () => {
  return (
    <div>
      <div className="flex w-full flex-row items-center justify-between px-4 py-6">
        <div className="flex flex-row items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="size-4" />
      </div>
      <Separator />
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="flex flex-row items-center justify-between rounded-sm border px-4 py-2"
            key={index}
          >
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="size-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

const MessengerBotList = ({
  selectedBotId,
  bots,
  handleSelect,
}: {
  bots: IFacebookBot[];
  selectedBotId: string;
  handleSelect: (_id: string) => void;
}) => {
  const { t } = useTranslation('frontline');

  if (!bots?.length) {
    return (
      <div className="flex flex-col items-center gap-2 text-accent-foreground">
        <IconRobotFace />
        <p>{t('no-bots-configured', "There's no bots configured")}</p>
        <Button variant="secondary" asChild>
          <Link to={`/settings/automations/bots/facebook-messenger-bots`}>
            <Label>
              {t('create-first-bot', 'Create first facebook messenger bot')}
            </Label>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {bots.map((bot) => (
        <MessengerBotRow
          key={bot._id}
          bot={bot}
          isSelected={selectedBotId === bot._id}
          onSelect={() => handleSelect(bot._id)}
        />
      ))}
    </div>
  );
};

const MessengerBotRow = ({
  bot,
  isSelected,
  onSelect,
}: {
  bot: IFacebookBot;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { statusLabel, statusVariant } = useFacebookBotHealthCell(bot.health);
  // A broken bot never answers, so picking it would build a dead automation.
  const isBroken = bot.health?.status === 'broken';

  return (
    <div
      role="button"
      tabIndex={isBroken ? -1 : 0}
      aria-disabled={isBroken}
      onClick={() => !isBroken && onSelect()}
      className={cn(
        'flex flex-row items-center gap-3 rounded-sm border px-4 py-2 transition-colors',
        isBroken
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:border-blue-500',
      )}
    >
      {isSelected && <IconCheck className="size-4 shrink-0" />}
      <Avatar className="size-6">
        <Avatar.Image src={bot.profileUrl || '/images/erxes-bot.svg'} />
        <Avatar.Fallback>{(bot.name || '').charAt(0)}</Avatar.Fallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm">{bot.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {getPageName(bot)}
        </span>
      </div>
      <Badge variant={statusVariant} className="ml-auto">
        {statusLabel}
      </Badge>
      <Link
        to={`/settings/automations/bots/facebook-messenger-bots?facebookBotId=${bot._id}`}
        onClick={(event) => event.stopPropagation()}
      >
        <IconSettings className="size-4 text-muted-foreground" />
      </Link>
    </div>
  );
};
