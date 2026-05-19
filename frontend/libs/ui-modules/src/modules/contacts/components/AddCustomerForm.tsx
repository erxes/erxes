import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Editor,
  Form,
  Input,
  ScrollArea,
  Select,
  Switch,
  Upload,
  toast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectMember } from '../../team-members/components/SelectMember';
import { useAddCustomer } from '../hooks/useAddCustomer';

const EMAIL_VALIDATION_STATUSES = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Disposable', value: 'disposable' },
  { label: 'Catch all', value: 'catchall' },
  { label: 'Bad syntax', value: 'bad_syntax' },
  { label: 'Not checked', value: 'not_checked' },
];

const PHONE_VALIDATION_STATUSES = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Unverifiable', value: 'unverifiable' },
  { label: 'Mobile phone', value: 'mobile_phone' },
];

const SCHEMA = z.object({
  avatar: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  code: z.string().optional(),
  ownerId: z.string().optional(),
  primaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  emailValidationStatus: z.string().optional(),
  primaryPhone: z.string().optional(),
  phoneValidationStatus: z.string().optional(),
  description: z.string().optional(),
  isSubscribed: z.string().optional(),
});

type FormValues = z.infer<typeof SCHEMA>;

export function AddCustomerForm({
  onOpenChange,
  state = 'customer',
  onSuccess,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
  state?: 'lead' | 'customer';
  onSuccess?: (id: string) => void;
}>) {
  const { customersAdd, loading } = useAddCustomer();

  const form = useForm<FormValues>({
    resolver: zodResolver(SCHEMA),
    defaultValues: {
      avatar: '',
      firstName: '',
      lastName: '',
      code: '',
      ownerId: '',
      primaryEmail: '',
      emailValidationStatus: 'unknown',
      primaryPhone: '',
      phoneValidationStatus: 'unknown',
      description: '',
      isSubscribed: 'Yes',
    },
  });

  function onSubmit(data: FormValues) {
    customersAdd({
      variables: { ...data, state },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: (result) => {
        onSuccess?.(result.customersAdd._id);
        toast({
          title: 'Success',
          description:
            state === 'lead'
              ? 'Lead created successfully'
              : 'Customer created successfully',
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
                          Upload an avatar for the customer
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
                name="firstName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      First Name{' '}
                      <span className="text-destructive">*</span>
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
                name="lastName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Last Name</Form.Label>
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
                name="primaryEmail"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Email</Form.Label>
                    <Form.Control>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="emailValidationStatus"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Email Verification Status</Form.Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Choose">
                            {
                              EMAIL_VALIDATION_STATUSES.find(
                                (s) => s.value === field.value,
                              )?.label
                            }
                          </Select.Value>
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        <Select.Group>
                          {EMAIL_VALIDATION_STATUSES.map((s) => (
                            <Select.Item key={s.value} value={s.value}>
                              {s.label}
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="primaryPhone"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control>
                      <Input placeholder="+1 234 567 8900" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="phoneValidationStatus"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Phone Verification Status</Form.Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Choose">
                            {
                              PHONE_VALIDATION_STATUSES.find(
                                (s) => s.value === field.value,
                              )?.label
                            }
                          </Select.Value>
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        <Select.Group>
                          {PHONE_VALIDATION_STATUSES.map((s) => (
                            <Select.Item key={s.value} value={s.value}>
                              {s.label}
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select>
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
                      scope="customer-add-description"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="isSubscribed"
              control={form.control}
              render={({ field }) => (
                <Form.Item className="flex items-center space-x-2 space-y-0">
                  <Form.Control>
                    <Switch
                      checked={field.value === 'Yes'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'Yes' : 'No')
                      }
                    />
                  </Form.Control>
                  <Form.Label variant="peer">Subscribed</Form.Label>
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
            {state === 'lead'
              ? 'Create Lead'
              : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
