import { FACEBOOK_BOT_DETAIL } from '@/integrations/facebook/graphql/queries/facebookBots';
import { useQuery } from '@apollo/client';
import { IconList } from '@tabler/icons-react';
import { Checkbox, cn, Spinner } from 'erxes-ui';
import {
  TMessageTriggerFormDirectMessage,
  TMessageTriggerFormPersistentMenu,
} from '../states/messageTriggerFormSchema';

type Props = {
  botId: string;
  selectedPersistentMenuIds?: string[];
  onConditionChange: (
    fieldName: 'persistentMenuIds' | 'conditions',
    fieldValue:
      | TMessageTriggerFormDirectMessage
      | TMessageTriggerFormPersistentMenu,
  ) => void;
};

const useFacebookBot = (botId: string) => {
  const { data, loading } = useQuery(FACEBOOK_BOT_DETAIL, {
    variables: { _id: botId },
  });

  const { facebookMessengerBot } = data || {};

  return {
    loading,
    facebookMessengerBot,
  };
};

export const FacebookBotPersistenceMenuSelector = ({
  botId,
  selectedPersistentMenuIds = [],
  onConditionChange,
}: Props) => {
  const { facebookMessengerBot, loading } = useFacebookBot(botId);

  if (loading) {
    return <Spinner />;
  }

  const { persistentMenus = [] } = facebookMessengerBot || {};

  if (!persistentMenus.length) {
    return (
      <div className="text-muted-foreground flex justify-center">
        <IconList className="w-6 h-6" />
        <p>No persistent menus in selected bot</p>
        <span>
          Persistent menu with link can't display as selectable condition on
          section
        </span>
      </div>
    );
  }

  const onCheck = (_id: string) => {
    const updatedMenuIds = selectedPersistentMenuIds.includes(_id)
      ? selectedPersistentMenuIds.filter((id) => id !== _id)
      : [...selectedPersistentMenuIds, _id];

    onConditionChange('persistentMenuIds', updatedMenuIds);
  };

  return (
    <div className="p-4">
      {persistentMenus.map(
        ({ _id, text, type }: any, index: number) =>
          type !== 'link' && (
            <div
              key={_id}
              className={cn(
                `flex flex-row gap-4 border rounded-lg w-full px-4 py-2 font-semibold text-muted-foreground text-sm`,
                { 'mt-2': index > 0 },
              )}
            >
              <Checkbox
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 rounded-full border-2 border-blue-500"
                checked={selectedPersistentMenuIds?.includes(_id)}
                onCheckedChange={() => onCheck(_id)}
              />

              <span>{text}</span>
            </div>
          ),
      )}
    </div>
  );
};
