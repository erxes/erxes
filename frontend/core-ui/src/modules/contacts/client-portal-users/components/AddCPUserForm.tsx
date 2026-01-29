import { CPUserAddSheetHeader } from './CPUserAddSheet';
import {
  cpUserAddFormSchema,
  CPUserAddFormType,
} from '@/contacts/client-portal-users/constants/cpUserFormSchema';
import { CP_USERS_ADD } from '@/contacts/client-portal-users/graphql/cpUsersAdd';
import { GET_CLIENT_PORTAL_USERS } from '@/contacts/client-portal-users/graphql/getClientPortalUsers';
import { useClientPortals } from '@/client-portal/hooks/useClientPortals';
import { ApolloError, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ControllerRenderProps } from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  ScrollArea,
  Select,
  Sheet,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function AddCPUserForm({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const { clientPortals, loading: loadingPortals } = useClientPortals();
  const [cpUsersAdd, { loading: submitting }] = useMutation(CP_USERS_ADD, {
    refetchQueries: [{ query: GET_CLIENT_PORTAL_USERS }],
  });
  const form = useForm<CPUserAddFormType>({
    resolver: zodResolver(cpUserAddFormSchema),
    defaultValues: {
      clientPortalId: '',
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      userType: 'customer',
    },
  });
  const { toast } = useToast();
  const [, setCpUserId] = useQueryState<string>('cpUserId');
  const { t } = useTranslation('contact');

  const onSubmit = (data: CPUserAddFormType) => {
    cpUsersAdd({
      variables: {
        clientPortalId: data.clientPortalId,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName?.trim() || undefined,
        username: data.username?.trim() || undefined,
        password: data.password?.trim() || undefined,
        userType: data.userType,
      },
      onError: (e: ApolloError) => {
        toast({
          title: t('error', { defaultValue: 'Error' }),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: (result) => {
        form.reset();
        onOpenChange?.(false);
        const id = result?.cpUsersAdd?._id;
        if (id) setCpUserId(id);
        toast({
          title: t('success', { defaultValue: 'Success' }),
          variant: 'success',
          description: t('clientPortalUser.add.success', {
            defaultValue: 'Client portal user created',
          }),
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <CPUserAddSheetHeader />
        <Sheet.Content>
          <ScrollArea className="flex-auto">
            <div className="p-5 space-y-4">
              <Form.Field
                control={form.control}
                name="clientPortalId"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    CPUserAddFormType,
                    'clientPortalId'
                  >;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('clientPortal', { defaultValue: 'Client portal' })}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingPortals}
                      >
                        <Select.Trigger>
                          <Select.Value
                            placeholder={t('select', {
                              defaultValue: 'Select...',
                            })}
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {(clientPortals || []).map((portal) => (
                            <Select.Item key={portal._id} value={portal._id!}>
                              {portal.name || portal._id}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="userType"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserAddFormType, 'userType'>;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('type', { defaultValue: 'Type' })}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? 'customer'}
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="customer">Customer</Select.Item>
                          <Select.Item value="company">Company</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="email"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserAddFormType, 'email'>;
                }) => (
                  <Form.Item>
                    <Form.Label>Email</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="email@example.com" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="phone"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserAddFormType, 'phone'>;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('phone', { defaultValue: 'Phone' })}
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="+1234567890" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="firstName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserAddFormType, 'firstName'>;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('firstName', { defaultValue: 'First name' })}
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
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserAddFormType, 'lastName'>;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('lastName', { defaultValue: 'Last name' })}
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
                name="username"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserAddFormType, 'username'>;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('username', { defaultValue: 'Username' })}
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
                name="password"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserAddFormType, 'password'>;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('password', { defaultValue: 'Password' })}
                    </Form.Label>
                    <Form.Control>
                      <Input type="password" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 gap-1 px-5">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => onOpenChange?.(false)}
          >
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={submitting}
          >
            {t('save', { defaultValue: 'Save' })}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}
