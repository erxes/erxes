import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { Avatar, Label, Spinner } from 'erxes-ui';

export const TriggerBotProfile = ({
  bot,
  loading,
}: {
  bot?: IFacebookBot;
  loading: boolean;
}) => {
  if (loading) {
    return <Spinner />;
  }

  if (!bot) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <Avatar className="h-8 w-8">
        <Avatar.Image src={bot.profileUrl || '/images/erxes-bot.svg'} />
        <Avatar.Fallback>{(bot.name || '').charAt(0)}</Avatar.Fallback>
      </Avatar>
      <Label className="text-muted-foreground">
        {bot.name || 'Not found bot'}
      </Label>
    </div>
  );
};
