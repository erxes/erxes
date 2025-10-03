import React, { useId, useState } from 'react';
import { Select } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import {
  PHONE_VALIDATION_STATUS_INFOS,
  PhoneIconComponents,
} from 'erxes-ui/constants/PhoneValidationStatusInfos';

interface PhoneVerificationInputProps {
  value: string | null;
  className?: string;
  onChange: (value: string) => void;
  inputValue: string;
}
export const PhoneVerificationInput = ({
  value,
  onChange,
  className,
  inputValue,
}: PhoneVerificationInputProps) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const currentStatus = PHONE_VALIDATION_STATUS_INFOS.find(
    (info) => info.value === currentValue,
  );

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const IconComponent =
    PhoneIconComponents[currentStatus?.icon || 'IconCircleDashed'];

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={currentValue || 'unknown'}
      onValueChange={handleValueChange}
    >
      <Select.Trigger
        id={id}
        className={cn(
          'flex items-center w-min [&>svg]:hidden',
          className,
        )}
      >
        <IconComponent
          className={cn('!block', currentStatus?.className)}
          size={16}
        />
      </Select.Trigger>
      <Select.Content className="text-base font-medium shadow-lg">
        {PHONE_VALIDATION_STATUS_INFOS.map((info) => {
          const ItemIcon = PhoneIconComponents[info.icon];
          return (
            <Select.Item
              key={info.value}
              value={info.value}
              className={cn(
                'h-cell w-56',
                currentStatus?.value === info.value && 'bg-muted',
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <ItemIcon className={cn('', info.className)} size={16} />
                <span>{info.label}</span>
              </div>
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select>
  );
};

export default PhoneVerificationInput;
