import { IconBrandMessenger } from '@tabler/icons-react';
import { Checkbox, cn } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { MESSAGE_TRIGGER_CONDITIONS } from '../constants/messageTriggerForm';
import { TMessageTriggerForm } from '../states/messageTriggerFormSchema';
import { getConditionsFieldErrors } from '../utils/messageTriggerUtils';

type Props = {
  setActiveItemType: React.Dispatch<React.SetStateAction<string>>;
  selectedConditionTypes?: string[];
  onItemCheck: (type: string, isChecked: boolean) => void;
};

export const MessageTriggerConditionsList = ({
  setActiveItemType,
  onItemCheck,
  selectedConditionTypes,
}: Props) => {
  const { getFieldState } = useFormContext<TMessageTriggerForm>();
  const errors = getConditionsFieldErrors(getFieldState('conditions'));

  return (
    <div className="flex flex-col gap-2 p-4">
      {MESSAGE_TRIGGER_CONDITIONS.map(({ label, description, type }) => (
        <>
          <div
            key={type}
            onClick={(e) => {
              e.preventDefault();
              setActiveItemType(type);
            }}
            className={cn(
              `flex flex-row gap-4 items-center p-4 border rounded  transition-all ease-in-out duration-300`,
              {
                'hover:border-blue-500 cursor-pointer': type !== 'getStarted',
                'cursor-not-allowed': type === 'getStarted',
              },
            )}
          >
            <Checkbox
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              checked={(selectedConditionTypes || []).includes(type)}
              onCheckedChange={(checked) => onItemCheck(type, !!checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="rounded-full bg-blue-500 text-background p-3">
              {/* <TablerIcon name={icon} /> */}
              <IconBrandMessenger />
            </div>
            <div>
              <p className="font-semibold text-muted-foreground text-sm">
                {label}
              </p>
              <span className="font-mono text-muted-foreground text-xs">
                {description}
              </span>
              {errors[type] && (
                <p className="text-destructive text-xs">{errors[type] || ''}</p>
              )}
            </div>
          </div>
        </>
      ))}
    </div>
  );
};
