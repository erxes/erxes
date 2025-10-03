import { Checkbox, cn, Form, Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useFacebookMessengerTrigger } from '../hooks/useFacebookMessengerTrigger';
import { TMessageTriggerForm } from '../states/messageTriggerFormSchema';
import { getConditionsFieldErrors } from '../utils/messageTriggerUtils';
import { IconBrandMessenger } from '@tabler/icons-react';

type Props = {
  setActiveItemType: React.Dispatch<React.SetStateAction<string>>;
  selectedConditionTypes?: string[];
  onItemCheck: (type: string, isChecked: boolean) => void;
  form: UseFormReturn<TMessageTriggerForm>;
};

export const MessageTriggerConditionsList = ({
  setActiveItemType,
  onItemCheck,
  selectedConditionTypes,
  form,
}: Props) => {
  const { triggerConditionsConstants, loading } = useFacebookMessengerTrigger();

  if (loading) {
    return <Spinner />;
  }
  const errors = getConditionsFieldErrors(form.getFieldState('conditions'));

  return (
    <div className="flex flex-col gap-2 p-4">
      {triggerConditionsConstants.map(({ label, description, type, icon }) => (
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
