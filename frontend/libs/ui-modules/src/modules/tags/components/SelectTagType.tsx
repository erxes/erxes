import React, { useEffect, useRef, useState } from 'react';
import { ITagType } from '../types/Tag';
import { ButtonProps, cn, Combobox, Command, Popover } from 'erxes-ui';
import { useTagsTypes } from '../hooks/useTagsTypes';

interface SelectTagTypeProps extends Omit<ButtonProps, 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  forceMount?: boolean;
}

interface TriggerProps extends ButtonProps {
  currentValue: string;
  currentName: string;
}

export const SelectTagType = React.forwardRef<
  HTMLButtonElement,
  SelectTagTypeProps
>(({ value, onValueChange, forceMount, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  const { types } = useTagsTypes();

  const currentValue = types?.find(
    (type: ITagType) => type.contentType === value,
  )?.contentType;

  const handleSelectType = (contentType: string) => {
    onValueChange(contentType === currentValue ? '' : contentType);
    setOpen(false);
  };
  return (
    <Popover onOpenChange={setOpen} defaultOpen={forceMount} modal>
      <SelectTagTypeTrigger
        currentValue={currentValue || ''}
        currentName={
          types.find((type: ITagType) => type.contentType === currentValue)
            ?.description || ''
        }
        ref={ref}
        {...props}
      />
      <Combobox.Content>
        <SelectTagTypeCommand
          forceMount={forceMount}
          currentValue={currentValue}
          handleSelectType={handleSelectType}
        />
      </Combobox.Content>
    </Popover>
  );
});

export const SelectTagTypeCommand = ({
  currentValue,
  handleSelectType,
  forceMount,
}: {
  currentValue: string;
  handleSelectType: (contentType: string) => void;
  forceMount?: boolean;
}) => {
  const { types, loading, error } = useTagsTypes();
  const [search, setSearch] = React.useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && forceMount) {
      inputRef.current.focus();
    }
  }, [forceMount]);

  return (
    <Command shouldFilter={false} id="tags-type-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search type..."
        ref={inputRef}
      />
      <Command.List>
        <Combobox.Empty loading={loading} error={error} />
        {types?.map((type: ITagType) => (
          <SelectTagTypeItem
            key={type.contentType}
            type={type}
            currentValue={currentValue || ''}
            handleSelectType={handleSelectType}
          />
        ))}
      </Command.List>
    </Command>
  );
};

const SelectTagTypeTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ currentName, className, ...props }, ref) => {
    return (
      <Combobox.Trigger
        className={cn('w-full flex', className)}
        ref={ref}
        {...props}
      >
        <Combobox.Value
          value={currentName}
          placeholder="Select type"
          className="truncate"
        />
      </Combobox.Trigger>
    );
  },
);

interface SelectTagTypeItemProps {
  type: ITagType;
  handleSelectType: (contentType: string) => void;
  currentValue: string;
}

const SelectTagTypeItem: React.FC<SelectTagTypeItemProps> = ({
  type,
  handleSelectType,
  currentValue,
}) => {
  return (
    <Command.Item
      key={type.contentType}
      className="h-7"
      value={type.contentType}
      onSelect={() => handleSelectType(type.contentType)}
      title={type.description}
    >
      <span className="text-xs text-foreground truncate">
        {type.description}
      </span>
      <Combobox.Check checked={currentValue === type.contentType} />
    </Command.Item>
  );
};
