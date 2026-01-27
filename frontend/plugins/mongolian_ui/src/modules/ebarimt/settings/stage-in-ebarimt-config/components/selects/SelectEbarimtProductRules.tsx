import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  cn,
  Combobox,
  Command,
  PopoverScoped,
  SelectTriggerVariant,
} from 'erxes-ui';
import { useEbarimtProductRules } from '../../hooks/useEbarimtProductRules';
import {
  SelectContent,
  SelectTrigger,
} from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectShared';

interface IProductRule {
  _id: string;
  title: string;
  kind: string;
  [key: string]: any;
}

interface SelectEbarimtProductRulesContextType {
  value: string;
  onValueChange: (ruleId: string) => void;
  loading?: boolean;
  error?: any;
  productRules?: IProductRule[];
  kind: 'vat' | 'ctax';
}

const SelectEbarimtProductRulesContext =
  createContext<SelectEbarimtProductRulesContextType | null>(null);

const useSelectEbarimtProductRulesContext = () => {
  const context = useContext(SelectEbarimtProductRulesContext);
  if (!context) {
    throw new Error(
      'useSelectEbarimtProductRulesContext must be used within SelectEbarimtProductRulesProvider',
    );
  }
  return context;
};

export const SelectEbarimtProductRulesProvider = ({
  value,
  onValueChange,
  kind,
  children,
}: {
  value: string;
  onValueChange: (ruleId: string) => void;
  children: React.ReactNode;
  kind: 'vat' | 'ctax';
}) => {
  const { productRules, loading, error } = useEbarimtProductRules(kind);

  const handleValueChange = useCallback(
    (ruleId: string) => {
      if (!ruleId) return;
      onValueChange?.(ruleId);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      value: value || '',
      onValueChange: handleValueChange,
      productRules,
      loading,
      error,
      kind,
    }),
    [value, handleValueChange, productRules, loading, error, kind],
  );

  return (
    <SelectEbarimtProductRulesContext.Provider value={contextValue}>
      {children}
    </SelectEbarimtProductRulesContext.Provider>
  );
};

const SelectEbarimtProductRulesValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { value, productRules } = useSelectEbarimtProductRulesContext();
  const selectedRule = productRules?.find((rule) => rule._id === value);

  if (!selectedRule) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Select rule'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className={cn('font-medium text-sm capitalize', className)}>
        {selectedRule.title}
      </p>
    </div>
  );
};

const SelectEbarimtProductRulesCommandItem = ({
  rule,
}: {
  rule: IProductRule;
}) => {
  const { onValueChange, value } = useSelectEbarimtProductRulesContext();
  const { _id: ruleId, title } = rule || {};

  return (
    <Command.Item
      value={ruleId}
      onSelect={() => {
        onValueChange(ruleId);
      }}
    >
      <span className="font-medium capitalize">{title}</span>
      <Combobox.Check checked={value === ruleId} />
    </Command.Item>
  );
};

const SelectEbarimtProductRulesContent = () => {
  const { productRules, loading, error } =
    useSelectEbarimtProductRulesContext();

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

    return productRules?.map((rule) => (
      <SelectEbarimtProductRulesCommandItem key={rule._id} rule={rule} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search rule" />
      <Command.Empty>
        <span className="text-muted-foreground">No rules found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectEbarimtProductRulesRoot = ({
  value,
  kind,
  variant = 'form',
  scope,
  onValueChange,
  disabled,
}: {
  value: string;
  kind: 'vat' | 'ctax';
  variant?: `${SelectTriggerVariant}`;
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
    <SelectEbarimtProductRulesProvider
      kind={kind}
      value={value}
      onValueChange={handleValueChange}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTrigger variant={variant} disabled={disabled}>
          <SelectEbarimtProductRulesValue />
        </SelectTrigger>
        <SelectContent variant={variant}>
          <SelectEbarimtProductRulesContent />
        </SelectContent>
      </PopoverScoped>
    </SelectEbarimtProductRulesProvider>
  );
};

export const SelectEbarimtProductRules = Object.assign(
  SelectEbarimtProductRulesRoot,
  {
    Provider: SelectEbarimtProductRulesProvider,
    Value: SelectEbarimtProductRulesValue,
    Content: SelectEbarimtProductRulesContent,
  },
);
