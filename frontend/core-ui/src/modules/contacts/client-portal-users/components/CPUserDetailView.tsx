import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { ControllerRenderProps } from 'react-hook-form';
import {
  Badge,
  Button,
  Empty,
  Form,
  Input,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  useConfirm,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { DataListItem } from '@/contacts/components/ContactDataListItem';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';
import { CP_USERS_EDIT } from '@/contacts/client-portal-users/graphql/cpUsersEdit';
import { CP_USERS_REMOVE } from '@/contacts/client-portal-users/graphql/cpUsersRemove';
import { GET_CLIENT_PORTAL_USER } from '@/contacts/client-portal-users/graphql/getClientPortalUser';
import { GET_CLIENT_PORTAL_USERS } from '@/contacts/client-portal-users/graphql/getClientPortalUsers';
import {
  cpUserEditFormSchema,
  CPUserEditFormType,
} from '@/contacts/client-portal-users/constants/cpUserFormSchema';
import { ApolloError, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function displayName(
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
  } | null,
) {
  if (!user) return '-';
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return user.email || user.phone || user.username || '-';
}

export const CPUserDetailView = () => {
  const [_id, setCpUserId] = useQueryState<string>('cpUserId');
  const { cpUser, loading, error } = useClientPortalUser();
  const [isEditing, setIsEditing] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('contact');

  const [cpUsersEdit, { loading: editLoading }] = useMutation(CP_USERS_EDIT, {
    refetchQueries: [
      { query: GET_CLIENT_PORTAL_USER, variables: { _id } },
      { query: GET_CLIENT_PORTAL_USERS },
    ],
  });
  const [cpUsersRemove, { loading: removeLoading }] = useMutation(
    CP_USERS_REMOVE,
    {
      refetchQueries: [{ query: GET_CLIENT_PORTAL_USERS }],
    },
  );

  const form = useForm<CPUserEditFormType>({
    resolver: zodResolver(cpUserEditFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      companyName: '',
      companyRegistrationNumber: '',
    },
  });

  useEffect(() => {
    if (cpUser) {
      form.reset({
        firstName: cpUser.firstName ?? '',
        lastName: cpUser.lastName ?? '',
        username: cpUser.username ?? '',
        companyName: cpUser.companyName ?? '',
        companyRegistrationNumber: cpUser.companyRegistrationNumber ?? '',
      });
    }
  }, [cpUser, form]);

  const notFound = !_id || (!loading && !cpUser);

  const handleSaveEdit = (data: CPUserEditFormType) => {
    if (!_id) return;
    cpUsersEdit({
      variables: {
        _id,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        username: data.username || undefined,
        companyName: data.companyName || undefined,
        companyRegistrationNumber: data.companyRegistrationNumber || undefined,
      },
      onError: (e: ApolloError) => {
        toast({
          title: t('error', { defaultValue: 'Error' }),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        setIsEditing(false);
        toast({
          title: t('success', { defaultValue: 'Success' }),
          variant: 'success',
          description: t('clientPortalUser.edit.success', {
            defaultValue: 'User updated',
          }),
        });
      },
    });
  };

  const handleDelete = () => {
    if (!_id) return;
    confirm({
      message: t('clientPortalUser.delete.confirm', {
        defaultValue:
          'Are you sure you want to delete this client portal user?',
      }),
    }).then(() => {
      cpUsersRemove({
        variables: { _id },
        onError: (e: ApolloError) => {
          toast({
            title: t('error', { defaultValue: 'Error' }),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          setCpUserId(null);
          toast({
            title: t('success', { defaultValue: 'Success' }),
            variant: 'success',
            description: t('clientPortalUser.delete.success', {
              defaultValue: 'User deleted',
            }),
          });
        },
      });
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (notFound) {
    return (
      <Empty className="flex-1">
        <Empty.Header>
          <Empty.Title>Client Portal User not found</Empty.Title>
        </Empty.Header>
      </Empty>
    );
  }

  if (isEditing && cpUser) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSaveEdit)}
          className="flex flex-col h-full"
        >
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              <Form.Field
                control={form.control}
                name="firstName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<CPUserEditFormType, 'firstName'>;
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
                  field: ControllerRenderProps<CPUserEditFormType, 'lastName'>;
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
                  field: ControllerRenderProps<CPUserEditFormType, 'username'>;
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
                name="companyName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    CPUserEditFormType,
                    'companyName'
                  >;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('company', { defaultValue: 'Company' })}
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
                name="companyRegistrationNumber"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<
                    CPUserEditFormType,
                    'companyRegistrationNumber'
                  >;
                }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('companyRegistrationNumber', {
                        defaultValue: 'Company registration number',
                      })}
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 p-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={editLoading}>
              {t('save', { defaultValue: 'Save' })}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return cpUser ? (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-end gap-2 -mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <IconPencil className="w-4 h-4" />
            {t('edit', { defaultValue: 'Edit' })}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-destructive"
            onClick={handleDelete}
            disabled={removeLoading}
          >
            <IconTrash className="w-4 h-4" />
            {t('delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
        <DataListItem label="Name">
          <span>{displayName(cpUser)}</span>
        </DataListItem>
        <DataListItem label="Email">
          <span className="text-muted-foreground">{cpUser.email || '-'}</span>
        </DataListItem>
        <DataListItem label="Phone">
          <span className="text-muted-foreground">{cpUser.phone || '-'}</span>
        </DataListItem>
        <DataListItem label="Type">
          {cpUser.type ? (
            <Badge variant="secondary">{cpUser.type}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </DataListItem>
        <DataListItem label="Company">
          <span className="text-muted-foreground">
            {cpUser.companyName || '-'}
          </span>
        </DataListItem>
        <DataListItem label="Verified">
          <Badge variant={cpUser.isVerified ? 'success' : 'secondary'}>
            {cpUser.isVerified ? 'Yes' : 'No'}
          </Badge>
        </DataListItem>
        <DataListItem label="Email verified">
          <Badge variant={cpUser.isEmailVerified ? 'success' : 'secondary'}>
            {cpUser.isEmailVerified ? 'Yes' : 'No'}
          </Badge>
        </DataListItem>
        <DataListItem label="Phone verified">
          <Badge variant={cpUser.isPhoneVerified ? 'success' : 'secondary'}>
            {cpUser.isPhoneVerified ? 'Yes' : 'No'}
          </Badge>
        </DataListItem>
        {cpUser.lastLoginAt && (
          <DataListItem label="Last login">
            <RelativeDateDisplay value={cpUser.lastLoginAt} asChild>
              <RelativeDateDisplay.Value value={cpUser.lastLoginAt} />
            </RelativeDateDisplay>
          </DataListItem>
        )}
        <DataListItem label="Created">
          {cpUser.createdAt ? (
            <RelativeDateDisplay value={cpUser.createdAt} asChild>
              <RelativeDateDisplay.Value value={cpUser.createdAt} />
            </RelativeDateDisplay>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </DataListItem>
      </div>
    </ScrollArea>
  ) : null;
};
