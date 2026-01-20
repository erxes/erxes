import { useInstagramBot } from '@/integrations/instagram/hooks/useInstagramBots';
import { IInstagramBot } from '@/integrations/instagram/types/InstagramBot';
import { Avatar, Label, Separator, Spinner } from 'erxes-ui';
import { AutomationTriggerConfigProps } from 'ui-modules';
import { TMessageTriggerFormCondition } from '../states/messageTriggerFormSchema';
import { MESSAGE_TRIGGER_CONDITIONS } from '../constants/messageTriggerForm';

type Props = {
  botId: string;
  conditions: TMessageTriggerFormCondition[];
};

export const TriggerConfigContent = ({
  config,
}: AutomationTriggerConfigProps<Props>) => {
  const { conditions = [], botId } = config || {};
  const { bot, loading } = useInstagramBot(botId);

  return (
    <div className="p-2">
      <BotProfile bot={bot} loading={loading} />
      <Separator />
      {conditions.map(
        (condition: TMessageTriggerFormCondition, index: number) => (
          <Condition
            key={index}
            bot={bot}
            condition={condition}
            totalCount={
              conditions.filter(({ isSelected }) => isSelected).length
            }
            index={index}
          />
        ),
      )}
    </div>
  );
};

const BotProfile = ({
  bot,
  loading,
}: {
  bot?: IInstagramBot;
  loading: boolean;
}) => {
  if (loading) {
    return <Spinner />;
  }
  if (!bot) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <Avatar className="w-8 h-8">
        <Avatar.Image src={bot?.profileUrl || '/images/erxes-bot.svg'} />
        <Avatar.Fallback>{(bot?.name || '').charAt(0)}</Avatar.Fallback>
      </Avatar>
      <Label className="text-muted-foreground">
        {bot?.name || 'Not found bot'}
      </Label>
    </div>
  );
};

const renderDescriptionContent = (
  condition: TMessageTriggerFormCondition,
  bot?: IInstagramBot,
) => {
  if (condition.type === 'direct') {
    return (condition?.conditions || []).map(({ keywords = [] }) =>
      keywords.map(({ text }) => text).join(','),
    );
  }

  if (condition.type === 'persistentMenu') {
    const { persistentMenuIds = [] } = condition || {};
    const { persistentMenus = [] } = bot || {};

    return persistentMenus
      .filter(({ _id }) => persistentMenuIds.includes(_id))
      .map(({ text }) => text)
      .join(',');
  }

  return '';
};

const Condition = ({
  index,
  bot,
  condition,
  totalCount,
}: {
  index: number;
  condition: TMessageTriggerFormCondition;
  bot?: IInstagramBot;
  totalCount: number;
}) => {
  if (!condition?.isSelected) {
    return null;
  }

  const { label, description } =
    MESSAGE_TRIGGER_CONDITIONS.find((c: any) => c.type === condition.type) ||
    {};

  const renderORSeparator = () => {
    if (totalCount > 1 && index + 1 !== totalCount) {
      return <span className="flex justify-center">OR</span>;
    }

    return null;
  };

  return (
    <>
      <div key={condition._id}>
        <p className="font-semibold text-sm">{label}</p>
        <span className="text-accent-foreground">
          {description}
          <span className="text-primary">
            {` ${renderDescriptionContent(condition, bot)}`}
          </span>
        </span>
      </div>
      {renderORSeparator()}
    </>
  );
};
