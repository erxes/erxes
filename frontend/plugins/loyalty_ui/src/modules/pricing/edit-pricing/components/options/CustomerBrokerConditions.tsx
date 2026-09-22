import { type ReactNode } from 'react';
import { Form, Label, Separator } from 'erxes-ui';
import {
  type Control,
  type ControllerRenderProps,
  type FieldValues,
} from 'react-hook-form';
import {
  SelectCompany,
  SelectCustomer,
  SelectMember,
  SelectPositions,
  SelectSegment,
  SelectTags,
} from 'ui-modules';
import { IPricingPlanDetail } from '@/pricing/types';

export interface CustomerBrokerFormValues {
  customerIds: string[];
  customerTags: string[];
  customerExcludeTags: string[];
  customerSegmentId: string | null;

  companyIds: string[];
  companyTags: string[];
  companyExcludeTags: string[];
  companySegmentId: string | null;

  userIds: string[];
  userPositions: string[];
  userSegmentId: string | null;

  brokerCustomerIds: string[];
  brokerCustomerTags: string[];
  brokerCustomerExcludeTags: string[];
  brokerCustomerSegmentId: string | null;

  brokerCompanyIds: string[];
  brokerCompanyTags: string[];
  brokerCompanyExcludeTags: string[];
  brokerCompanySegmentId: string | null;

  brokerUserIds: string[];
  brokerUserPositions: string[];
  brokerUserSegmentId: string | null;
}

export const CUSTOMER_BROKER_DEFAULTS: CustomerBrokerFormValues = {
  customerIds: [],
  customerTags: [],
  customerExcludeTags: [],
  customerSegmentId: null,
  companyIds: [],
  companyTags: [],
  companyExcludeTags: [],
  companySegmentId: null,
  userIds: [],
  userPositions: [],
  userSegmentId: null,
  brokerCustomerIds: [],
  brokerCustomerTags: [],
  brokerCustomerExcludeTags: [],
  brokerCustomerSegmentId: null,
  brokerCompanyIds: [],
  brokerCompanyTags: [],
  brokerCompanyExcludeTags: [],
  brokerCompanySegmentId: null,
  brokerUserIds: [],
  brokerUserPositions: [],
  brokerUserSegmentId: null,
};

export const customerBrokerFromDetail = (
  detail: IPricingPlanDetail,
): CustomerBrokerFormValues => ({
  customerIds: detail.customerIds || [],
  customerTags: detail.customerTags || [],
  customerExcludeTags: detail.customerExcludeTags || [],
  customerSegmentId: detail.customerSegmentIds?.[0] || null,
  companyIds: detail.companyIds || [],
  companyTags: detail.companyTags || [],
  companyExcludeTags: detail.companyExcludeTags || [],
  companySegmentId: detail.companySegmentIds?.[0] || null,
  userIds: detail.userIds || [],
  userPositions: detail.userPositions || [],
  userSegmentId: detail.userSegmentIds?.[0] || null,
  brokerCustomerIds: detail.brokerCustomerIds || [],
  brokerCustomerTags: detail.brokerCustomerTags || [],
  brokerCustomerExcludeTags: detail.brokerCustomerExcludeTags || [],
  brokerCustomerSegmentId: detail.brokerCustomerSegmentIds?.[0] || null,
  brokerCompanyIds: detail.brokerCompanyIds || [],
  brokerCompanyTags: detail.brokerCompanyTags || [],
  brokerCompanyExcludeTags: detail.brokerCompanyExcludeTags || [],
  brokerCompanySegmentId: detail.brokerCompanySegmentIds?.[0] || null,
  brokerUserIds: detail.brokerUserIds || [],
  brokerUserPositions: detail.brokerUserPositions || [],
  brokerUserSegmentId: detail.brokerUserSegmentIds?.[0] || null,
});

const toSegmentArray = (id: string | null): string[] => (id ? [id] : []);

export const customerBrokerToDoc = (
  values: CustomerBrokerFormValues,
): Partial<IPricingPlanDetail> => ({
  customerIds: values.customerIds,
  customerTags: values.customerTags,
  customerExcludeTags: values.customerExcludeTags,
  customerSegmentIds: toSegmentArray(values.customerSegmentId),
  companyIds: values.companyIds,
  companyTags: values.companyTags,
  companyExcludeTags: values.companyExcludeTags,
  companySegmentIds: toSegmentArray(values.companySegmentId),
  userIds: values.userIds,
  userPositions: values.userPositions,
  userSegmentIds: toSegmentArray(values.userSegmentId),
  brokerCustomerIds: values.brokerCustomerIds,
  brokerCustomerTags: values.brokerCustomerTags,
  brokerCustomerExcludeTags: values.brokerCustomerExcludeTags,
  brokerCustomerSegmentIds: toSegmentArray(values.brokerCustomerSegmentId),
  brokerCompanyIds: values.brokerCompanyIds,
  brokerCompanyTags: values.brokerCompanyTags,
  brokerCompanyExcludeTags: values.brokerCompanyExcludeTags,
  brokerCompanySegmentIds: toSegmentArray(values.brokerCompanySegmentId),
  brokerUserIds: values.brokerUserIds,
  brokerUserPositions: values.brokerUserPositions,
  brokerUserSegmentIds: toSegmentArray(values.brokerUserSegmentId),
});

const toArray = (value: string[] | string | null | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];

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

const CustomerFields = ({
  control,
  idsName,
  tagsName,
  excludeTagsName,
  segmentName,
  tagType,
  labels,
}: {
  control: Control<CustomerBrokerFormValues>;
  idsName: 'customerIds' | 'brokerCustomerIds';
  tagsName: 'customerTags' | 'brokerCustomerTags';
  excludeTagsName: 'customerExcludeTags' | 'brokerCustomerExcludeTags';
  segmentName: 'customerSegmentId' | 'brokerCustomerSegmentId';
  tagType: 'core:customer';
  labels: {
    ids: string;
    segment: string;
    tags: string;
    excludeTags: string;
  };
}) => (
  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
    <ConditionField control={control} name={idsName} label={labels.ids}>
      {(field) => (
        <SelectCustomer
          mode="multiple"
          value={field.value}
          onValueChange={(value) => field.onChange(toArray(value))}
        />
      )}
    </ConditionField>

    <ConditionField control={control} name={segmentName} label={labels.segment}>
      {(field) => (
        <SelectSegment
          selected={field.value || undefined}
          onSelect={(id) => field.onChange(id)}
        />
      )}
    </ConditionField>

    <ConditionField control={control} name={tagsName} label={labels.tags}>
      {(field) => (
        <SelectTags
          tagType={tagType}
          mode="multiple"
          value={field.value}
          onValueChange={(value) => field.onChange(value as string[])}
        />
      )}
    </ConditionField>

    <ConditionField
      control={control}
      name={excludeTagsName}
      label={labels.excludeTags}
    >
      {(field) => (
        <SelectTags
          tagType={tagType}
          mode="multiple"
          value={field.value}
          onValueChange={(value) => field.onChange(value as string[])}
        />
      )}
    </ConditionField>
  </div>
);

const CompanyFields = ({
  control,
  idsName,
  tagsName,
  excludeTagsName,
  segmentName,
  tagType,
  labels,
}: {
  control: Control<CustomerBrokerFormValues>;
  idsName: 'companyIds' | 'brokerCompanyIds';
  tagsName: 'companyTags' | 'brokerCompanyTags';
  excludeTagsName: 'companyExcludeTags' | 'brokerCompanyExcludeTags';
  segmentName: 'companySegmentId' | 'brokerCompanySegmentId';
  tagType: 'core:company';
  labels: {
    ids: string;
    segment: string;
    tags: string;
    excludeTags: string;
  };
}) => (
  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
    <ConditionField control={control} name={idsName} label={labels.ids}>
      {(field) => (
        <SelectCompany
          mode="multiple"
          value={field.value}
          onValueChange={(value) => field.onChange(toArray(value))}
        />
      )}
    </ConditionField>

    <ConditionField control={control} name={segmentName} label={labels.segment}>
      {(field) => (
        <SelectSegment
          selected={field.value || undefined}
          onSelect={(id) => field.onChange(id)}
        />
      )}
    </ConditionField>

    <ConditionField control={control} name={tagsName} label={labels.tags}>
      {(field) => (
        <SelectTags
          tagType={tagType}
          mode="multiple"
          value={field.value}
          onValueChange={(value) => field.onChange(value as string[])}
        />
      )}
    </ConditionField>

    <ConditionField
      control={control}
      name={excludeTagsName}
      label={labels.excludeTags}
    >
      {(field) => (
        <SelectTags
          tagType={tagType}
          mode="multiple"
          value={field.value}
          onValueChange={(value) => field.onChange(value as string[])}
        />
      )}
    </ConditionField>
  </div>
);

const UserFields = ({
  control,
  idsName,
  positionsName,
  segmentName,
  labels,
}: {
  control: Control<CustomerBrokerFormValues>;
  idsName: 'userIds' | 'brokerUserIds';
  positionsName: 'userPositions' | 'brokerUserPositions';
  segmentName: 'userSegmentId' | 'brokerUserSegmentId';
  labels: {
    ids: string;
    segment: string;
    positions: string;
  };
}) => (
  <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
    <ConditionField control={control} name={idsName} label={labels.ids}>
      {(field) => (
        <SelectMember
          mode="multiple"
          value={field.value}
          onValueChange={(value) => field.onChange(toArray(value))}
        />
      )}
    </ConditionField>

    <ConditionField control={control} name={segmentName} label={labels.segment}>
      {(field) => (
        <SelectSegment
          selected={field.value || undefined}
          onSelect={(id) => field.onChange(id)}
        />
      )}
    </ConditionField>

    <ConditionField
      control={control}
      name={positionsName}
      label={labels.positions}
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
);

export const CustomerBrokerConditions = <
  TFormValues extends CustomerBrokerFormValues & FieldValues,
>({
  control,
}: {
  control: Control<TFormValues>;
}) => {
  const participantControl =
    control as unknown as Control<CustomerBrokerFormValues>;

  return (
    <div className="space-y-4">
      <SectionDivider label="Buyer conditions (optional)" />
      <CustomerFields
        control={participantControl}
        idsName="customerIds"
        tagsName="customerTags"
        excludeTagsName="customerExcludeTags"
        segmentName="customerSegmentId"
        tagType="core:customer"
        labels={{
          ids: 'CUSTOMERS',
          segment: 'CUSTOMER SEGMENT',
          tags: 'CUSTOMER TAGS',
          excludeTags: 'EXCLUDE CUSTOMER TAGS',
        }}
      />
      <Separator />
      <CompanyFields
        control={participantControl}
        idsName="companyIds"
        tagsName="companyTags"
        excludeTagsName="companyExcludeTags"
        segmentName="companySegmentId"
        tagType="core:company"
        labels={{
          ids: 'COMPANIES',
          segment: 'COMPANY SEGMENT',
          tags: 'COMPANY TAGS',
          excludeTags: 'EXCLUDE COMPANY TAGS',
        }}
      />
      <Separator />
      <UserFields
        control={participantControl}
        idsName="userIds"
        positionsName="userPositions"
        segmentName="userSegmentId"
        labels={{
          ids: 'USERS',
          segment: 'USER SEGMENT',
          positions: 'USER POSITIONS',
        }}
      />

      <SectionDivider label="Broker conditions (optional)" />
      <CustomerFields
        control={participantControl}
        idsName="brokerCustomerIds"
        tagsName="brokerCustomerTags"
        excludeTagsName="brokerCustomerExcludeTags"
        segmentName="brokerCustomerSegmentId"
        tagType="core:customer"
        labels={{
          ids: 'BROKER CUSTOMERS',
          segment: 'BROKER CUSTOMER SEGMENT',
          tags: 'BROKER CUSTOMER TAGS',
          excludeTags: 'EXCLUDE BROKER CUSTOMER TAGS',
        }}
      />
      <Separator />
      <CompanyFields
        control={participantControl}
        idsName="brokerCompanyIds"
        tagsName="brokerCompanyTags"
        excludeTagsName="brokerCompanyExcludeTags"
        segmentName="brokerCompanySegmentId"
        tagType="core:company"
        labels={{
          ids: 'BROKER COMPANIES',
          segment: 'BROKER COMPANY SEGMENT',
          tags: 'BROKER COMPANY TAGS',
          excludeTags: 'EXCLUDE BROKER COMPANY TAGS',
        }}
      />
      <Separator />
      <UserFields
        control={participantControl}
        idsName="brokerUserIds"
        positionsName="brokerUserPositions"
        segmentName="brokerUserSegmentId"
        labels={{
          ids: 'BROKERS',
          segment: 'BROKER USER SEGMENT',
          positions: 'BROKER POSITIONS',
        }}
      />
    </div>
  );
};
