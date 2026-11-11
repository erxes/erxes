import type { Customer, CustomerInput } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Select, Textarea, useQueryState, useToast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormSheet } from '~/components/FormSheet';
import { useMembers } from '~/components/inlineCells';
import { isApiError, messageOf } from '~/lib/api';
import { CUSTOMER_SHEET_PARAM, useCustomerCreate } from './useCustomers';

const NONE = 'none';

const schema = z.object({
  state: z.enum(['lead', 'customer']),
  firstName: z.string().trim().max(100),
  lastName: z.string().trim().max(100),
  primaryEmail: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  primaryPhone: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{3,32}$/, 'Enter a valid phone number'),
  ]),
  sex: z.string(),
  position: z.string().trim().max(200),
  department: z.string().trim().max(200),
  code: z.string().trim().max(100),
  ownerId: z.string(),
  description: z.string().trim().max(5000),
});

type Values = z.infer<typeof schema>;

const valuesOf = (customer: Customer | undefined, state: Customer['state']): Values => ({
  state: customer?.state ?? state,
  firstName: customer?.firstName ?? '',
  lastName: customer?.lastName ?? '',
  primaryEmail: customer?.primaryEmail ?? '',
  primaryPhone: customer?.primaryPhone ?? '',
  sex: customer?.sex === null || customer?.sex === undefined ? NONE : String(customer.sex),
  position: customer?.position ?? '',
  department: customer?.department ?? '',
  code: customer?.code ?? '',
  ownerId: customer?.ownerId ?? NONE,
  description: customer?.description ?? '',
});

const SEX_OPTIONS = [
  { value: NONE, label: 'Not set' },
  { value: '1', label: 'Male' },
  { value: '2', label: 'Female' },
  { value: '9', label: 'Not applicable' },
  { value: '0', label: 'Not known' },
];

const toInput = (values: Values): CustomerInput => {
  const text = (value: string) => value || null;

  return {
    state: values.state,
    firstName: text(values.firstName),
    lastName: text(values.lastName),
    primaryEmail: text(values.primaryEmail),
    primaryPhone: text(values.primaryPhone),
    sex: values.sex === NONE ? null : (Number(values.sex) as CustomerInput['sex']),
    position: text(values.position),
    department: text(values.department),
    code: text(values.code),
    ownerId: values.ownerId === NONE ? null : values.ownerId,
    description: text(values.description),
  };
};

const TextInput = ({ name, label, type }: { name: keyof Values; label: string; type?: string }) => (
  <Form.Field
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input {...field} type={type} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

const Choice = ({
  name,
  label,
  options,
}: {
  name: keyof Values;
  label: string;
  options: { value: string; label: string }[];
}) => (
  <Form.Field
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Select value={field.value} onValueChange={field.onChange}>
          <Form.Control>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
          </Form.Control>
          <Select.Content>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Form.Message />
      </Form.Item>
    )}
  />
);

/** Team members for the owner field. */
export const useOwnerOptions = () => [
  { value: NONE, label: 'No owner' },
  ...useMembers().map((member) => ({ value: member.id, label: member.fullName || member.email })),
];

/** `?customerId=new`: add a customer (or lead) in a side sheet. */
export const CustomerSheet = ({ state }: { state: Customer['state'] }) => {
  const [openId, setOpenId] = useQueryState<string>(CUSTOMER_SHEET_PARAM);
  const open = openId === 'new';
  const { toast } = useToast();
  const create = useCustomerCreate();
  const owners = useOwnerOptions();
  const [existingId, setExistingId] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: valuesOf(undefined, state) });

  useEffect(() => {
    if (open) {
      setExistingId(null);
      form.reset(valuesOf(undefined, state));
    }
  }, [open, state, form]);

  const submit = form.handleSubmit(async (values) => {
    if (!values.firstName && !values.lastName && !values.primaryEmail && !values.primaryPhone) {
      form.setError('firstName', { message: 'Enter a name, an email or a phone' });

      return;
    }

    try {
      const customer = await create.mutateAsync(toInput(values));

      toast({ variant: 'success', title: values.state === 'lead' ? 'Lead added' : 'Customer added' });
      // Continue in the detail panel, as old core-ui does after creating.
      setOpenId(customer.id);
    } catch (error) {
      if (isApiError(error, 'CUSTOMER_EXISTS')) {
        const details = error.data as { field?: 'primaryEmail' | 'primaryPhone'; id?: string | null };

        form.setError(details.field ?? 'primaryEmail', { message: error.message });
        setExistingId(details.id ?? null);

        return;
      }

      toast({ variant: 'destructive', title: 'Could not add the customer', description: messageOf(error) });
    }
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => !next && setOpenId(null)}
      title={`Add ${state === 'lead' ? 'lead' : 'customer'}`}
      submitLabel="Create"
      submitting={form.formState.isSubmitting}
      onSubmit={submit}
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-3">
          <TextInput name="firstName" label="First name" />
          <TextInput name="lastName" label="Last name" />
        </div>
        <TextInput name="primaryEmail" label="Email" type="email" />
        <TextInput name="primaryPhone" label="Phone" type="tel" />
        {existingId && (
          <Button type="button" variant="outline" onClick={() => setOpenId(existingId)}>
            Open the existing customer
          </Button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Choice
            name="state"
            label="Type"
            options={[
              { value: 'customer', label: 'Customer' },
              { value: 'lead', label: 'Lead' },
            ]}
          />
          <Choice name="sex" label="Sex" options={SEX_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput name="position" label="Position" />
          <TextInput name="department" label="Department" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput name="code" label="Code" />
          <Choice name="ownerId" label="Owner" options={owners} />
        </div>
        <Form.Field
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea {...field} rows={4} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </Form>
    </FormSheet>
  );
};
