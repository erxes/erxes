import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { type Icon } from '@tabler/icons-react';
import {
  cn,
  Form,
  Input,
  PopoverScoped,
  RecordTableInlineCell,
  Select,
  TextField,
} from 'erxes-ui';
import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelField,
  PanelFieldTrigger,
} from 'ui-modules';

export const PRODUCT_PANEL_SELECT_CLASS_NAME =
  'h-7 min-w-0 rounded-sm px-2 font-normal shadow-none hover:bg-accent';

export const ProductPanelPlaceholder = ({
  icon: Icon,
  children,
}: {
  icon: Icon;
  children: React.ReactNode;
}) => (
  <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
    <span className="truncate">{children}</span>
  </span>
);

export const ProductPanelTextField = ({
  name,
  label,
  icon: Icon,
  placeholder = label,
  disabled,
  suffix,
}: {
  name: 'name' | 'shortName' | 'code';
  label: string;
  icon: Icon;
  placeholder?: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
}) => {
  const form = useFormContext<ProductFormValues>();

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item
          className="space-y-0"
          onSubmit={(event) => event.stopPropagation()}
        >
          <PanelField icon={Icon} label={label}>
            <div className="flex min-w-0 items-center gap-1">
              <Form.Control>
                <TextField
                  scope={`product-panel.${name}`}
                  value={field.value || ''}
                  placeholder={placeholder}
                  aria-label={label}
                  disabled={disabled}
                  className={cn(
                    PANEL_TEXT_FIELD_CLASS_NAME,
                    'min-w-0 flex-1',
                    !field.value && 'text-muted-foreground',
                  )}
                  onSave={field.onChange}
                >
                  {!field.value && (
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  )}
                </TextField>
              </Form.Control>
              {suffix}
            </div>
          </PanelField>
          <Form.Message className="pl-[7rem] text-xs" />
        </Form.Item>
      )}
    />
  );
};

export const ProductPanelNumberField = ({
  name,
  label,
  icon: Icon,
}: {
  name: 'unitPrice' | 'weight' | 'duration';
  label: string;
  icon: Icon;
}) => {
  const form = useFormContext<ProductFormValues>();
  const [open, setOpen] = useState(false);
  const previousValue = useRef<number | undefined>();

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item className="space-y-0">
          <PanelField icon={Icon} label={label}>
            <PopoverScoped
              scope={`product-panel.${name}`}
              open={open}
              onOpenChange={(next) => {
                if (next) previousValue.current = field.value;
                setOpen(next);
              }}
            >
              <Form.Control>
                <PanelFieldTrigger aria-label={label}>
                  {field.value == null ? (
                    <ProductPanelPlaceholder icon={Icon}>
                      {label}
                    </ProductPanelPlaceholder>
                  ) : (
                    field.value.toLocaleString(undefined, {
                      maximumFractionDigits: 20,
                    })
                  )}
                </PanelFieldTrigger>
              </Form.Control>
              <RecordTableInlineCell.Content
                onEscapeKeyDown={() => field.onChange(previousValue.current)}
              >
                <Input
                  type="number"
                  step="any"
                  value={field.value ?? ''}
                  aria-label={label}
                  placeholder={label}
                  onChange={(event) =>
                    field.onChange(
                      event.currentTarget.value === ''
                        ? undefined
                        : Number(event.currentTarget.value),
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      setOpen(false);
                    }
                  }}
                />
              </RecordTableInlineCell.Content>
            </PopoverScoped>
          </PanelField>
          <Form.Message className="pl-[7rem] text-xs" />
        </Form.Item>
      )}
    />
  );
};

export const ProductPanelSelectField = ({
  name,
  label,
  icon: Icon,
  options,
}: {
  name: 'type' | 'durationType';
  label: string;
  icon: Icon;
  options: readonly { label: string; value: string }[];
}) => {
  const form = useFormContext<ProductFormValues>();

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item className="space-y-0">
          <PanelField icon={Icon} label={label}>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger
                  className={PRODUCT_PANEL_SELECT_CLASS_NAME}
                  aria-label={label}
                >
                  <Select.Value
                    placeholder={
                      <ProductPanelPlaceholder icon={Icon}>
                        {label}
                      </ProductPanelPlaceholder>
                    }
                  />
                </Select.Trigger>
              </Form.Control>
              <Select.Content align="start">
                {options.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </PanelField>
          <Form.Message className="pl-[7rem] text-xs" />
        </Form.Item>
      )}
    />
  );
};
