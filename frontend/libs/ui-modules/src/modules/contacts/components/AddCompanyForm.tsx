import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CountryPhoneCodes,
  Editor,
  Form,
  Input,
  MultipleSelector,
  ScrollArea,
  Select,
  Upload,
  toast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  COMPANY_BUSINESS_TYPES,
  DEFAULT_COMPANY_INDUSTRY_TYPES,
} from '../constants/companyConstants';
import { useAddCompany } from '../hooks/useAddCompany';
import { SelectCompany } from './SelectCompany';
import { SelectMember } from '../../team-members/components/SelectMember';

const INDUSTRY_OPTIONS = DEFAULT_COMPANY_INDUSTRY_TYPES.filter(Boolean).map(
  (i) => ({ label: i, value: i }),
);

const SCHEMA = z.object({
  avatar: z.string().optional(),
  primaryName: z.string().min(1, 'Company name is required'),
  code: z.string().optional(),
  ownerId: z.string().optional(),
  parentCompanyId: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  location: z.string().optional(),
  businessType: z.string().optional(),
  size: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.number().optional(),
  ),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof SCHEMA>;

export function AddCompanyForm({
  onOpenChange,
  onSuccess,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
  onSuccess?: (id: string) => void;
}>) {
  const { companiesAdd, loading } = useAddCompany();

  const form = useForm<FormValues>({
    resolver: zodResolver(SCHEMA),
    defaultValues: {
      avatar: '',
      primaryName: '',
      code: '',
      ownerId: '',
      parentCompanyId: '',
      email: '',
      phone: '',
      website: '',
      industry: [],
      location: '',
      businessType: '',
      size: undefined,
      description: '',
    },
  });

  function onSubmit(data: FormValues) {
    const { phone, industry, ...rest } = data;
    companiesAdd({
      variables: {
        ...rest,
        primaryPhone: phone,
        industry: industry?.map((i) => i.value),
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: (result) => {
        onSuccess?.(result.companiesAdd._id);
        toast({
          title: 'Success',
          description: 'Company created successfully',
          variant: 'success',
        });
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden bg-background"
      >
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4">
            <Form.Field
              name="avatar"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <Upload.Root
                      {...field}
                      value={field.value || ''}
                      onChange={(fileInfo) => {
                        if ('url' in fileInfo) {
                          field.onChange(fileInfo.url);
                        }
                      }}
                    >
                      <Upload.Preview className="rounded-full" />
                      <div className="flex flex-col justify-center gap-2">
                        <div className="flex gap-4">
                          <Upload.Button
                            size="sm"
                            variant="outline"
                            type="button"
                          >
                            Upload
                          </Upload.Button>
                          <Upload.RemoveButton
                            size="sm"
                            variant="outline"
                            type="button"
                          />
                        </div>
                        <Form.Description>
                          Upload an avatar for the company
                        </Form.Description>
                      </div>
                    </Upload.Root>
                  </Form.Control>
                </Form.Item>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="primaryName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      Name <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Code</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Owner</Form.Label>
                    <Form.Control>
                      <div className="w-full">
                        <SelectMember.FormItem
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          placeholder="Select owner"
                        />
                      </div>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="parentCompanyId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Parent Company</Form.Label>
                    <Form.Control>
                      <SelectCompany
                        mode="single"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Email</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="website"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Website</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Industries</Form.Label>
                    <Form.Control>
                      <MultipleSelector
                        defaultOptions={INDUSTRY_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select industries"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="location"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Headquarters country</Form.Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Select country" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {CountryPhoneCodes.map((country) => (
                          <Select.Item
                            key={country.code}
                            value={country.name}
                          >
                            <span className="mr-2">{country.flag}</span>
                            {country.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Business Type</Form.Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {COMPANY_BUSINESS_TYPES.filter(Boolean).map(
                          (type) => (
                            <Select.Item key={type} value={type}>
                              {type}
                            </Select.Item>
                          ),
                        )}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="size"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Size</Form.Label>
                    <Form.Control>
                      <Input type="number" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Editor
                      initialContent={field.value}
                      onChange={field.onChange}
                      scope="company-add-description"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Company'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
