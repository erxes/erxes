import React, { useId, useState } from 'react';
import { Button, Select } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import {
  EMAIL_VALIDATION_STATUS_INFOS,
  EmailIconComponents,
} from 'erxes-ui/constants/EmailValidationStatusInfos';
import { IconCopy } from '@tabler/icons-react';

interface EmailVerificationInputProps {
  value: string | null;
  className?: string;
  onChange: (value: string) => void;
  inputValue: string;
}
export const EmailVerificationInput = ({
  value,
  onChange,
  className,
  inputValue,
}: EmailVerificationInputProps) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const currentStatus = EMAIL_VALIDATION_STATUS_INFOS.find(
    (info) => info.value === currentValue,
  );

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const IconComponent =
    EmailIconComponents[currentStatus?.icon || 'IconCircleDashed'];

  const onCopy = () => {
    navigator.clipboard.writeText(inputValue);
    setOpen(false);
    // To do: add on success handler
  };
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
          'flex items-center gap-2 w-min [&>svg]:hidden px-2',
          className,
        )}
      >
        <IconComponent
          className={cn('!block', currentStatus?.className)}
          size={16}
        />
      </Select.Trigger>
      <Select.Content className="text-base font-medium shadow-lg">
        {EMAIL_VALIDATION_STATUS_INFOS.map((info) => {
          const ItemIcon = EmailIconComponents[info.icon];
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
        <Select.Separator />
        <Button
          variant="ghost"
          className="flex items-center border-transparent py-1.5 pl-2 pr-8 gap-2 rounded-sm w-full justify-start h-cell"
          onClick={onCopy}
        >
          <IconCopy size={16} />
          <span>Copy email</span>
        </Button>
      </Select.Content>
    </Select>
  );
};

export default EmailVerificationInput;
