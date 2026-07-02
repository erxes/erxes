import { type ReactNode } from 'react';
import { Form, Label, ToggleGroup } from 'erxes-ui';
import {
  useWatch,
  type Control,
  type ControllerRenderProps,
  type FieldValues,
} from 'react-hook-form';
import {
  SelectCustomer,
  SelectCompany,
  SelectMember,
  SelectSegment,
  SelectTags,
  SelectPositions,
} from 'ui-modules';
import { IPricingPlanDetail } from '@/pricing/types';

/**
 * Customer (buyer) + broker targeting fields, rendered in the
 * Participants tab. The buyer is typed: `customerType` selects customer vs company,
 * and only the active kind's fields are shown and persisted. The broker is
 * always a team-member/user.
 *
 * Segments are single-select here for parity with the rest of the pricing form;
 * the backend stores them as arrays, so multi-segment is a future-safe upgrade.
 */
export interface CustomerBrokerFormValues {
  customerType: 'customer' | 'company';

  customerIds: string[];
  customerTags: string[];
  customerExcludeTags: string[];
  customerSegmentId: string | null;

  companyIds: string[];
  companyTags: string[];
  companyExcludeTags: string[];
  companySegmentId: string | null;

  brokerUserIds: string[];
  brokerUserPositions: string[];
  brokerSegmentId: string | null;
}

export const CUSTOMER_BROKER_DEFAULTS: CustomerBrokerFormValues = {
  customerType: 'customer',
  customerIds: [],
  customerTags: [],
  customerExcludeTags: [],
  customerSegmentId: null,
  companyIds: [],
  companyTags: [],
  companyExcludeTags: [],
  companySegmentId: null,
  brokerUserIds: [],
  brokerUserPositions: [],
  brokerSegmentId: null,
};

/** Map a saved plan into the customer/broker form slice. */
export const customerBrokerFromDetail = (
  detail: IPricingPlanDetail,
): CustomerBrokerFormValues => ({
  customerType: detail.customerType === 'company' ? 'company' : 'customer',
  customerIds: detail.customerIds || [],
  customerTags: detail.customerTags || [],
  customerExcludeTags: detail.customerExcludeTags || [],
  customerSegmentId: detail.customerSegmentIds?.[0] || null,
  companyIds: detail.companyIds || [],
  companyTags: detail.companyTags || [],
  companyExcludeTags: detail.companyExcludeTags || [],
  companySegmentId: detail.companySegmentIds?.[0] || null,
  brokerUserIds: detail.brokerUserIds || [],
  brokerUserPositions: detail.brokerUserPositions || [],
  brokerSegmentId: detail.brokerSegmentIds?.[0] || null,
});

const toSegmentArray = (id: string | null): string[] => (id ? [id] : []);

/**
 * Build the persisted customer/broker doc slice. Only the active customerType's
 * fields are written; the inactive kind is explicitly cleared so a plan never
 * carries contradictory stale targeting (one coherent intent per document).
 */
export const customerBrokerToDoc = (
  values: CustomerBrokerFormValues,
): Partial<IPricingPlanDetail> => {
  const isCompany = values.customerType === 'company';

  return {
    customerType: values.customerType,

    customerIds: isCompany ? [] : values.customerIds,
    customerTags: isCompany ? [] : values.customerTags,
    customerExcludeTags: isCompany ? [] : values.customerExcludeTags,
    customerSegmentIds: isCompany
      ? []
      : toSegmentArray(values.customerSegmentId),

    companyIds: isCompany ? values.companyIds : [],
    companyTags: isCompany ? values.companyTags : [],
    companyExcludeTags: isCompany ? values.companyExcludeTags : [],
    companySegmentIds: isCompany
      ? toSegmentArray(values.companySegmentId)
      : [],

    brokerUserIds: values.brokerUserIds,
    brokerUserPositions: values.brokerUserPositions,
    brokerSegmentIds: toSegmentArray(values.brokerSegmentId),
  };
};

/** Coerce a single-or-multi selector value into a string[] for the form. */
const toArray = (value: string[] | string | null | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];

/** Labeled field wrapper so each selector below stays a one-liner. */
function ConditionField<Name extends keyof CustomerBrokerFormValues>({
  control,
  name,
  label,
  className,
  children,
}: {
  control: Control<CustomerBrokerFormValues>;
  name: Name;
  label: string;
  className?: string;
  children: (
    field: ControllerRenderProps<CustomerBrokerFormValues, Name>,
  ) => ReactNode;
}) {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item className={className}>
          <Form.Label>{label}</Form.Label>
          <Form.Control>{children(field)}</Form.Control>
        </Form.Item>
      )}
    />
  );
}

const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center my-4">
    <div className="flex-1 border-t" />
    <Label className="mx-2">{label}</Label>
    <div className="flex-1 border-t" />
  </div>
);

export const CustomerBrokerConditions = <
  TFormValues extends CustomerBrokerFormValues & FieldValues,
>({
  control,
}: {
  control: Control<TFormValues>;
}) => {
  // React Hook Form's Control is invariant, while the host forms extend this
  // slice with additional fields. Narrow once at this boundary for the slice UI.
  const customerBrokerControl =
    control as unknown as Control<CustomerBrokerFormValues>;
  const customerType = useWatch({
    control: customerBrokerControl,
    name: 'customerType',
  });
  const isCompany = customerType === 'company';

  return (
    <div className="space-y-4">
      <SectionDivider label="Customer & broker conditions (optional)" />

      <ConditionField
        control={customerBrokerControl}
        name="customerType"
        label="BUYER TYPE"
      >
        {(field) => (
          <ToggleGroup
            type="single"
            value={field.value}
            onValueChange={(value) => value && field.onChange(value)}
            className="grid w-full max-w-xs grid-cols-2 gap-2"
          >
            <ToggleGroup.Item value="customer" className="border rounded-md">
              Customer
            </ToggleGroup.Item>
            <ToggleGroup.Item value="company" className="border rounded-md">
              Company
            </ToggleGroup.Item>
          </ToggleGroup>
        )}
      </ConditionField>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        {!isCompany && (
          <>
            <ConditionField
              control={customerBrokerControl}
              name="customerIds"
              label="CUSTOMERS"
            >
              {(field) => (
                <SelectCustomer
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) => field.onChange(toArray(value))}
                />
              )}
            </ConditionField>

            <ConditionField
              control={customerBrokerControl}
              name="customerSegmentId"
              label="CUSTOMER SEGMENT"
            >
              {(field) => (
                <SelectSegment
                  selected={field.value || undefined}
                  onSelect={(id) => field.onChange(id)}
                />
              )}
            </ConditionField>

            <ConditionField
              control={customerBrokerControl}
              name="customerTags"
              label="CUSTOMER TAGS"
            >
              {(field) => (
                <SelectTags
                  tagType="core:customer"
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as string[])}
                />
              )}
            </ConditionField>

            <ConditionField
              control={customerBrokerControl}
              name="customerExcludeTags"
              label="EXCLUDE CUSTOMER TAGS"
            >
              {(field) => (
                <SelectTags
                  tagType="core:customer"
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as string[])}
                />
              )}
            </ConditionField>
          </>
        )}

        {isCompany && (
          <>
            <ConditionField
              control={customerBrokerControl}
              name="companyIds"
              label="COMPANIES"
            >
              {(field) => (
                <SelectCompany
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) => field.onChange(toArray(value))}
                />
              )}
            </ConditionField>

            <ConditionField
              control={customerBrokerControl}
              name="companySegmentId"
              label="COMPANY SEGMENT"
            >
              {(field) => (
                <SelectSegment
                  selected={field.value || undefined}
                  onSelect={(id) => field.onChange(id)}
                />
              )}
            </ConditionField>

            <ConditionField
              control={customerBrokerControl}
              name="companyTags"
              label="COMPANY TAGS"
            >
              {(field) => (
                <SelectTags
                  tagType="core:company"
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as string[])}
                />
              )}
            </ConditionField>

            <ConditionField
              control={customerBrokerControl}
              name="companyExcludeTags"
              label="EXCLUDE COMPANY TAGS"
            >
              {(field) => (
                <SelectTags
                  tagType="core:company"
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as string[])}
                />
              )}
            </ConditionField>
          </>
        )}
      </div>

      <SectionDivider label="Broker" />

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <ConditionField
          control={customerBrokerControl}
          name="brokerUserIds"
          label="BROKERS"
        >
          {(field) => (
            <SelectMember
              mode="multiple"
              value={field.value}
              onValueChange={(value) => field.onChange(toArray(value))}
            />
          )}
        </ConditionField>

        <ConditionField
          control={customerBrokerControl}
          name="brokerSegmentId"
          label="BROKER SEGMENT"
        >
          {(field) => (
            <SelectSegment
              selected={field.value || undefined}
              onSelect={(id) => field.onChange(id)}
            />
          )}
        </ConditionField>

        <ConditionField
          control={customerBrokerControl}
          name="brokerUserPositions"
          label="BROKER POSITIONS"
          className="lg:col-span-2"
        >
          {(field) => (
            <SelectPositions.FormItem
              mode="multiple"
              value={field.value}
              onValueChange={(value) => field.onChange(toArray(value))}
            />
          )}
        </ConditionField>
      </div>
    </div>
  );
};
