import { INSTAGRAM_BOT_DETAIL } from '@/integrations/instagram/graphql/queries/instagramBots';
import { useQuery } from '@apollo/client';
import { IconList } from '@tabler/icons-react';
import { Checkbox, cn, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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

const useInstagramBotDetail = (botId: string) => {
  const { data, loading } = useQuery(INSTAGRAM_BOT_DETAIL, {
    variables: { _id: botId },
  });

  return {
    loading,
    instagramMessengerBot: data?.instagramMessengerBot,
  };
};

export const InstagramBotPersistenceMenuSelector = ({
  botId,
  selectedPersistentMenuIds = [],
  onConditionChange,
}: Props) => {
  const { t } = useTranslation('frontline');
  const { instagramMessengerBot, loading } = useInstagramBotDetail(botId);

  if (loading) return <Spinner />;

  const { persistentMenus = [] } = instagramMessengerBot || {};

  if (!persistentMenus.length) {
    return (
      <div className="text-muted-foreground flex justify-center">
        <IconList className="w-6 h-6" />
        <p>{t('no-persistent-menus')}</p>
        <span>
          {t('persistent-menu-link-note')}
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
                'flex flex-row gap-4 border rounded-lg w-full px-4 py-2 font-semibold text-muted-foreground text-sm',
                { 'mt-2': index > 0 },
              )}
            >
              <Checkbox
                className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 rounded-full border-2 border-pink-500"
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
