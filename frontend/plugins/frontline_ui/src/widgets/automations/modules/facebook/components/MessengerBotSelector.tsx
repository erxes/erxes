import { useFacebookBots } from '@/integrations/facebook/hooks/useFacebookBots';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import {
  IconCheck,
  IconChevronDown,
  IconRobotFace,
  IconSettings,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Collapsible,
  Label,
  Separator,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router';

type Props = {
  onSelect: (id: string) => void;
  botId?: string;
};

export const FacebookBotSelector = ({ botId, onSelect }: Props) => {
  const [selectedBotId, setBotId] = useState(botId || '');
  const [isOpen, setOpen] = useState(!botId || false);

  const { bots, loading } = useFacebookBots();
  const selectedBot = bots.find((bot: any) => bot._id === selectedBotId);

  if (loading) {
    return <Spinner />;
  }

  const handleSelect = (_id: string) => {
    setOpen(false);
    setBotId(_id);
    onSelect(_id);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <div className="w-full flex flex-row justify-between items-center px-4 py-6 cursor-pointer">
          <div className="flex flex-row items-center gap-4">
            <Avatar className="w-8 h-8">
              <Avatar.Image
                src={selectedBot?.profileUrl || '/images/erxes-bot.svg'}
              />
              <Avatar.Fallback>
                {(selectedBot?.name || '').charAt(0)}
              </Avatar.Fallback>
            </Avatar>
            <Label className="text-lg text-muted-foreground">
              {selectedBot?.name || 'Select a bot'}
            </Label>
          </div>
          <IconChevronDown className="w-4 h-4" />
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

const MessengerBotList = ({
  selectedBotId,
  bots,
  handleSelect,
}: {
  bots: IFacebookBot[];
  selectedBotId: string;
  handleSelect: (_id: string) => void;
}) => {
  if (!bots?.length) {
    return (
      <div className="flex flex-col gap-2 items-center text-accent-foreground">
        <IconRobotFace />
        <p>There's no bots configured</p>
        <Button variant="secondary" asChild>
          <Link to={`/settings/automations/bots/facebook-messenger-bots`}>
            <Label>Create first facebook messenger bot</Label>
          </Link>
        </Button>
      </div>
    );
  }

  return bots.map(({ _id, profileUrl, name }: any) => (
    <div
      className="border rounded-sm px-4 py-2 flex flex-row justify-between items-center"
      key={_id}
      onClick={() => handleSelect(_id)}
    >
      <div className="flex flex-row gap-2 items-center">
        {selectedBotId === _id && <IconCheck className="w-4 h-4" />}
        <Avatar className="w-6 h-6">
          <Avatar.Image src={profileUrl || '/images/erxes-bot.svg'} />
          <Avatar.Fallback>{(name || '').charAt(0)}</Avatar.Fallback>
        </Avatar>
        {name}
      </div>
      <Link
        to={`/settings/automations/bots/facebook-messenger-bots?facebookBotId=${_id}`}
      >
        <IconSettings className="w-4 h-4 text-muted-foreground" />
      </Link>
    </div>
  ));
};
