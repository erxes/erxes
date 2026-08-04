import { IconList } from '@tabler/icons-react';
import { Checkbox, cn, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePersistentMenus } from '../../hooks/usePersistentMenus';
import { TMessageTriggerDirectConditions } from '../../types/messageTrigger';

type Props = {
  botId: string;
  selectedPersistentMenuIds?: string[];
  onConditionChange: (
    fieldName: 'persistentMenuIds' | 'conditions',
    fieldValue: TMessageTriggerDirectConditions | string[],
  ) => void;
};

export const PersistentMenuSelector = ({
  botId,
  selectedPersistentMenuIds = [],
  onConditionChange,
}: Props) => {
  const { t } = useTranslation('frontline');
  const { persistentMenus, loading } = usePersistentMenus(botId);
  const selectablePersistentMenus = persistentMenus.filter(
    ({ type }) => type === 'button',
  );

  if (loading) {
    return <Spinner />;
  }

  if (!selectablePersistentMenus.length) {
    return (
      <div className="flex justify-center text-muted-foreground">
        <IconList className="h-6 w-6" />
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
      {selectablePersistentMenus.map(({ _id, text }, index) => (
        <div
          key={_id}
          className={cn(
            'flex w-full flex-row gap-4 rounded-lg border px-4 py-2 text-sm font-semibold text-muted-foreground',
            { 'mt-2': index > 0 },
          )}
        >
          <Checkbox
            className="rounded-full border-2 border-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
            checked={selectedPersistentMenuIds.includes(_id)}
            onCheckedChange={() => onCheck(_id)}
          />

          <span>{text}</span>
        </div>
      ))}
    </div>
  );
};
