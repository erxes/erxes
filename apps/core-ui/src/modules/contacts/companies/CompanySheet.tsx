import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Select, Textarea, useQueryState, useToast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormSheet } from '~/components/FormSheet';
import { useMembers } from '~/components/inlineCells';
import { isApiError, messageOf } from '~/lib/api';
import { COMPANY_SHEET_PARAM, useCompanyCreate } from './useCompanies';

const NONE = 'none';

const schema = z.object({
  primaryName: z.string().trim().min(1, 'Enter a name').max(200),
  primaryEmail: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  primaryPhone: z.union([z.literal(''), z.string().trim().regex(/^\+?[0-9 ()-]{3,32}$/, 'Enter a valid phone number')]),
  website: z.string().trim().max(500),
  industry: z.string().trim().max(200),
  size: z.union([z.literal(''), z.string().regex(/^\d+$/, 'A whole number')]),
  ownerId: z.string(),
  description: z.string().trim().max(5000),
});

type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  primaryName: '',
  primaryEmail: '',
  primaryPhone: '',
  website: '',
  industry: '',
  size: '',
  ownerId: NONE,
  description: '',
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

/** `?companyId=new`: add a company in a side sheet. */
export const CompanySheet = () => {
  const [openId, setOpenId] = useQueryState<string>(COMPANY_SHEET_PARAM);
  const open = openId === 'new';
  const { toast } = useToast();
  const create = useCompanyCreate();
  const members = useMembers();
  const [existingId, setExistingId] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      setExistingId(null);
      form.reset(EMPTY);
    }
  }, [open, form]);

  const submit = form.handleSubmit(async (values) => {
    const text = (value: string) => value || null;

    try {
      const company = await create.mutateAsync({
        primaryName: values.primaryName,
        primaryEmail: text(values.primaryEmail),
        primaryPhone: text(values.primaryPhone),
        website: text(values.website),
        industry: text(values.industry),
        size: values.size ? Number(values.size) : null,
        ownerId: values.ownerId === NONE ? null : values.ownerId,
        description: text(values.description),
      });

      toast({ variant: 'success', title: 'Company added' });
      setOpenId(company.id);
    } catch (error) {
      if (isApiError(error, 'COMPANY_EXISTS')) {
        form.setError('primaryName', { message: error.message });
        setExistingId((error.data as { id?: string | null } | undefined)?.id ?? null);

        return;
      }

      toast({ variant: 'destructive', title: 'Could not add the company', description: messageOf(error) });
    }
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => !next && setOpenId(null)}
      title="Add company"
      submitLabel="Create"
      submitting={form.formState.isSubmitting}
      onSubmit={submit}
    >
      <Form {...form}>
        <TextInput name="primaryName" label="Name" />
        {existingId && (
          <Button type="button" variant="outline" onClick={() => setOpenId(existingId)}>
            Open the existing company
          </Button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <TextInput name="primaryEmail" label="Email" type="email" />
          <TextInput name="primaryPhone" label="Phone" type="tel" />
        </div>
        <TextInput name="website" label="Website" />
        <div className="grid grid-cols-2 gap-3">
          <TextInput name="industry" label="Industry" />
          <TextInput name="size" label="Employees" />
        </div>
        <Form.Field
          name="ownerId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Owner</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value={NONE}>No owner</Select.Item>
                  {members.map((member) => (
                    <Select.Item key={member.id} value={member.id}>
                      {member.fullName || member.email}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
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
