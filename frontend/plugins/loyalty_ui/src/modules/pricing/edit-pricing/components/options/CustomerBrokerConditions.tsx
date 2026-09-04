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
import type { CustomerBrokerFormValues } from '@/pricing/edit-pricing/components/participants/utils';

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

const EntityFields = ({
  control,
  entityType,
  idsName,
  tagsName,
  excludeTagsName,
  segmentName,
  labels,
}: {
  control: Control<CustomerBrokerFormValues>;
  entityType: 'customer' | 'company';
  idsName:
    | 'customerIds'
    | 'brokerCustomerIds'
    | 'companyIds'
    | 'brokerCompanyIds';
  tagsName:
    | 'customerTags'
    | 'brokerCustomerTags'
    | 'companyTags'
    | 'brokerCompanyTags';
  excludeTagsName:
    | 'customerExcludeTags'
    | 'brokerCustomerExcludeTags'
    | 'companyExcludeTags'
    | 'brokerCompanyExcludeTags';
  segmentName:
    | 'customerSegmentId'
    | 'brokerCustomerSegmentId'
    | 'companySegmentId'
    | 'brokerCompanySegmentId';
  labels: {
    ids: string;
    segment: string;
    tags: string;
    excludeTags: string;
  };
}) => {
  const tagType = entityType === 'customer' ? 'core:customer' : 'core:company';

  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
      <ConditionField control={control} name={idsName} label={labels.ids}>
        {(field) =>
          entityType === 'customer' ? (
            <SelectCustomer
              mode="multiple"
              value={field.value}
              onValueChange={(value) => field.onChange(toArray(value))}
            />
          ) : (
            <SelectCompany
              mode="multiple"
              value={field.value}
              onValueChange={(value) => field.onChange(toArray(value))}
            />
          )
        }
      </ConditionField>

      <ConditionField
        control={control}
        name={segmentName}
        label={labels.segment}
      >
        {(field) => (
          <SelectSegment
            selected={field.value || undefined}
            onSelect={(id) => field.onChange(id)}
            nullable
          />
        )}
      </ConditionField>

      <ConditionField control={control} name={tagsName} label={labels.tags}>
        {(field) => (
          <SelectTags
            tagType={tagType}
            mode="multiple"
            value={field.value}
            onValueChange={(value) => field.onChange(toArray(value))}
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
            onValueChange={(value) => field.onChange(toArray(value))}
          />
        )}
      </ConditionField>
    </div>
  );
};

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
          nullable
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
      <EntityFields
        control={participantControl}
        entityType="customer"
        idsName="customerIds"
        tagsName="customerTags"
        excludeTagsName="customerExcludeTags"
        segmentName="customerSegmentId"
        labels={{
          ids: 'CUSTOMERS',
          segment: 'CUSTOMER SEGMENT',
          tags: 'CUSTOMER TAGS',
          excludeTags: 'EXCLUDE CUSTOMER TAGS',
        }}
      />
      <Separator />
      <EntityFields
        control={participantControl}
        entityType="company"
        idsName="companyIds"
        tagsName="companyTags"
        excludeTagsName="companyExcludeTags"
        segmentName="companySegmentId"
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
      <EntityFields
        control={participantControl}
        entityType="customer"
        idsName="brokerCustomerIds"
        tagsName="brokerCustomerTags"
        excludeTagsName="brokerCustomerExcludeTags"
        segmentName="brokerCustomerSegmentId"
        labels={{
          ids: 'BROKER CUSTOMERS',
          segment: 'BROKER CUSTOMER SEGMENT',
          tags: 'BROKER CUSTOMER TAGS',
          excludeTags: 'EXCLUDE BROKER CUSTOMER TAGS',
        }}
      />
      <Separator />
      <EntityFields
        control={participantControl}
        entityType="company"
        idsName="brokerCompanyIds"
        tagsName="brokerCompanyTags"
        excludeTagsName="brokerCompanyExcludeTags"
        segmentName="brokerCompanySegmentId"
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
