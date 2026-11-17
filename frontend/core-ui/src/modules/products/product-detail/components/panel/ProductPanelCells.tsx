import {
  CurrencyCode,
  CurrencyField,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useState } from 'react';
import { PanelFieldTrigger, SelectCompany } from 'ui-modules';

// Plain selects drawn like the panel's other cells: the chevron shows on
// hover, as the other cells have none.
export const PANEL_SELECT_TRIGGER_CLASS_NAME =
  'h-7 rounded-sm px-2 shadow-none hover:bg-accent [&>svg]:opacity-0 hover:[&>svg]:opacity-100 focus-visible:[&>svg]:opacity-100';

export const toSingleId = (value: string[] | string) =>
  (Array.isArray(value) ? value[0] : value) || '';

// What to do with an empty cell, in place of its value. For cells that draw
// nothing when empty; the others take it as their own placeholder.
export const EmptyHint = ({ children }: { children: string }) => (
  <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-accent-foreground">
    {children}
  </span>
);

// A field's problem, under its row.
export const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="pb-1 pl-[7.75rem] text-xs text-destructive">{message}</p>
  ) : null;

// The supplier, a company: the company picker as a panel cell.
export const PanelVendorField = ({
  scope,
  value,
  placeholder,
  onChange,
}: {
  scope: string;
  value: string;
  placeholder: string;
  onChange: (vendorId: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCompany.Provider
      value={value}
      onValueChange={(next) => {
        setOpen(false);
        const vendorId = toSingleId(next);
        if (vendorId !== value) onChange(vendorId);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <PanelFieldTrigger>
          <SelectCompany.Value placeholder={placeholder} />
        </PanelFieldTrigger>
        <RecordTableInlineCell.Content>
          <SelectCompany.Content />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectCompany.Provider>
  );
};

export const PanelCurrencyField = ({
  scope,
  value,
  placeholder,
  onChange,
}: {
  scope: string;
  value: string;
  placeholder: string;
  onChange: (currency: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <PanelFieldTrigger>
        {value || <span className="text-accent-foreground">{placeholder}</span>}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <CurrencyField.SelectCurrencyCommand
          value={(value as CurrencyCode) || undefined}
          focusOnMount
          onSelect={(currency) => {
            setOpen(false);
            if (currency !== value) onChange(currency);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
