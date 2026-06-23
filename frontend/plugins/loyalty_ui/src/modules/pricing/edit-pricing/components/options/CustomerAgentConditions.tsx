import { type ReactNode } from 'react';
import { Form, Label, ToggleGroup } from 'erxes-ui';
import {
  useWatch,
  type Control,
  type ControllerRenderProps,
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
 * Customer (buyer) + agent (salesperson) targeting fields, rendered in the
 * Options tab. The buyer is typed: `customerType` selects customer vs company,
 * and only the active kind's fields are shown and persisted. The agent is
 * always a team-member/user.
 *
 * Segments are single-select here for parity with the rest of the pricing form;
 * the backend stores them as arrays, so multi-segment is a future-safe upgrade.
 */
export interface CustomerAgentFormValues {
  customerType: 'customer' | 'company';

  customerIds: string[];
  customerTags: string[];
  customerExcludeTags: string[];
  customerSegmentId: string | null;

  companyIds: string[];
  companyTags: string[];
  companyExcludeTags: string[];
  companySegmentId: string | null;

  agentUserIds: string[];
  agentUserPositions: string[];
  agentSegmentId: string | null;
}

export const CUSTOMER_AGENT_DEFAULTS: CustomerAgentFormValues = {
  customerType: 'customer',
  customerIds: [],
  customerTags: [],
  customerExcludeTags: [],
  customerSegmentId: null,
  companyIds: [],
  companyTags: [],
  companyExcludeTags: [],
  companySegmentId: null,
  agentUserIds: [],
  agentUserPositions: [],
  agentSegmentId: null,
};

/** Map a saved plan into the customer/agent form slice. */
export const customerAgentFromDetail = (
  detail: IPricingPlanDetail,
): CustomerAgentFormValues => ({
  customerType: detail.customerType === 'company' ? 'company' : 'customer',
  customerIds: detail.customerIds || [],
  customerTags: detail.customerTags || [],
  customerExcludeTags: detail.customerExcludeTags || [],
  customerSegmentId: detail.customerSegmentIds?.[0] || null,
  companyIds: detail.companyIds || [],
  companyTags: detail.companyTags || [],
  companyExcludeTags: detail.companyExcludeTags || [],
  companySegmentId: detail.companySegmentIds?.[0] || null,
  agentUserIds: detail.agentUserIds || [],
  agentUserPositions: detail.agentUserPositions || [],
  agentSegmentId: detail.agentSegmentIds?.[0] || null,
});

const toSegmentArray = (id: string | null): string[] => (id ? [id] : []);

/**
 * Build the persisted customer/agent doc slice. Only the active customerType's
 * fields are written; the inactive kind is explicitly cleared so a plan never
 * carries contradictory stale targeting (one coherent intent per document).
 */
export const customerAgentToDoc = (
  values: CustomerAgentFormValues,
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

    agentUserIds: values.agentUserIds,
    agentUserPositions: values.agentUserPositions,
    agentSegmentIds: toSegmentArray(values.agentSegmentId),
  };
};

/** Coerce a single-or-multi selector value into a string[] for the form. */
const toArray = (value: string[] | string | null): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];

/** Labeled field wrapper so each selector below stays a one-liner. */
function ConditionField<Name extends keyof CustomerAgentFormValues>({
  control,
  name,
  label,
  className,
  children,
}: {
  control: Control<CustomerAgentFormValues>;
  name: Name;
  label: string;
  className?: string;
  children: (
    field: ControllerRenderProps<CustomerAgentFormValues, Name>,
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

export const CustomerAgentConditions = ({
  control,
}: {
  // Host forms (Options edit / Create sheet) extend CustomerAgentFormValues.
  // Control is invariant in its field type, so accept any host form here and
  // keep the inner ConditionField strongly typed to CustomerAgentFormValues.
  control: Control<CustomerAgentFormValues>;
}) => {
  const customerType = useWatch({ control, name: 'customerType' });
  const isCompany = customerType === 'company';

  return (
    <div className="space-y-4">
      <SectionDivider label="Customer & agent conditions (optional)" />

      <ConditionField control={control} name="customerType" label="BUYER TYPE">
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
              control={control}
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
              control={control}
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
              control={control}
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
              control={control}
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
              control={control}
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
              control={control}
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
              control={control}
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
              control={control}
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

      <SectionDivider label="Agent (salesperson)" />

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <ConditionField control={control} name="agentUserIds" label="AGENTS">
          {(field) => (
            <SelectMember
              mode="multiple"
              value={field.value}
              onValueChange={(value) => field.onChange(toArray(value))}
            />
          )}
        </ConditionField>

        <ConditionField
          control={control}
          name="agentSegmentId"
          label="AGENT SEGMENT"
        >
          {(field) => (
            <SelectSegment
              selected={field.value || undefined}
              onSelect={(id) => field.onChange(id)}
            />
          )}
        </ConditionField>

        <ConditionField
          control={control}
          name="agentUserPositions"
          label="AGENT POSITIONS"
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
