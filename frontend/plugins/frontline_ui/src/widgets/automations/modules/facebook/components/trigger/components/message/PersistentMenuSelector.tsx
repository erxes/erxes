import { IconList } from '@tabler/icons-react';
import { Checkbox, cn, Spinner } from 'erxes-ui';
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
  const { persistentMenus, loading } = usePersistentMenus(botId);

  if (loading) {
    return <Spinner />;
  }

  if (!persistentMenus.length) {
    return (
      <div className="flex justify-center text-muted-foreground">
        <IconList className="h-6 w-6" />
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
        ({ _id, text, type }, index) =>
          type !== 'link' && (
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
          ),
      )}
    </div>
  );
};
