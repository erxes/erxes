import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { cn, Combobox, Command, PopoverScoped } from 'erxes-ui';
import {
  SelectTrigger,
  SelectContent,
  SelectTriggerVariant,
} from './SelectShared';
import { useGetPoslist } from '~/modules/ebarimt/settings/pos-in-ebarimt-config/hooks/useGetPosList';

interface IPos {
  _id: string;
  name: string;
  [key: string]: any;
}

interface SelectPosContextType {
  value: string;
  onValueChange: (posId: string) => void;
  loading?: boolean;
  error?: any;
  poss?: IPos[];
}

const SelectPosContext = createContext<SelectPosContextType | null>(null);

const useSelectPosContext = () => {
  const context = useContext(SelectPosContext);
  if (!context) {
    throw new Error(
      'useSelectPosContext must be used within SelectPosProvider',
    );
  }
  return context;
};

export const SelectPosProvider = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (posId: string) => void;
  children: React.ReactNode;
}) => {
  const { poss, loading, error } = useGetPoslist();

  const handleValueChange = useCallback(
    (posId: string) => {
      if (!posId) return;
      onValueChange?.(posId);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value: value || '',
      onValueChange: handleValueChange,
      poss,
      loading,
      error,
    }),
    [value, handleValueChange, poss, loading, error],
  );

  return (
    <SelectPosContext.Provider value={contextValue}>
      {children}
    </SelectPosContext.Provider>
  );
};

const SelectPosValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, poss } = useSelectPosContext();
  const selectedPos = poss?.find((pos) => pos._id === value);

  if (!selectedPos) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select pos'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedPos.name}
      </p>
    </div>
  );
};

const SelectPosCommandItem = ({ pos }: { pos: IPos }) => {
  const { onValueChange, value } = useSelectPosContext();
  const { _id: posId, name } = pos || {};

  return (
    <Command.Item
      value={posId}
      onSelect={() => {
        onValueChange(posId);
      }}
    >
      <span className="font-medium capitalize">{name}</span>
      <Combobox.Check checked={value === posId} />
    </Command.Item>
  );
};

const SelectPosContent = () => {
  const { poss, loading, error } = useSelectPosContext();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          Error: {error.message}
        </div>
      );
    }

    return poss?.map((pos) => (
      <SelectPosCommandItem key={pos._id} pos={pos} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search pos" />
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectPosRoot = ({
  value,
  variant,
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  variant: `${SelectTriggerVariant}`;
  scope?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectPosProvider
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectPosValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectPosContent />
        </SelectContent>
      </PopoverScoped>
    </SelectPosProvider>
  );
};

export const SelectPos = Object.assign(SelectPosRoot, {
  Provider: SelectPosProvider,
  Value: SelectPosValue,
  Content: SelectPosContent,
});
