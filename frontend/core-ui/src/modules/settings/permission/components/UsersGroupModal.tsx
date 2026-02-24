import {
  Button,
  Dialog,
  Form,
  Input,
  Spinner,
  Textarea,
  useToast,
} from 'erxes-ui';
import {
  IUserGroup,
  SelectMember,
  useUsersGroup,
  useUsersGroupsAdd,
  useUsersGroupsEdit,
} from 'ui-modules';
import { useEffect, useState } from 'react';
import { IconUsersPlus, IconX } from '@tabler/icons-react';
import { type UseFormReturn } from 'react-hook-form';
import { IUsersGroupFormSchema } from '@/settings/permission/types';
import { useUsersGroupForm } from '@/settings/permission/hooks/useUsersGroupForm';

export const UsersGroupFormFields = ({
  form,
}: {
  form: UseFormReturn<IUsersGroupFormSchema, any, IUsersGroupFormSchema>;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Name</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Description</Form.Label>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="memberIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Members</Form.Label>
            <Form.Control>
              <SelectMember.FormItem
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};

export const UsersGroupCreateForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { addUsersGroups, loading } = useUsersGroupsAdd();
  const { toast } = useToast();
  const { form } = useUsersGroupForm();

  const onSubmit = (data: IUsersGroupFormSchema) => {
    addUsersGroups({
      variables: {
        ...data,
      },
      onCompleted: () => {
        toast({ title: 'Created a group', variant: 'success' });
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <UsersGroupFormFields form={form} />
        <Button type="submit" className="ml-auto" disabled={loading}>
          {loading ? <Spinner /> : 'Create'}
        </Button>
      </form>
    </Form>
  );
};

export const UsersGroupEditForm = ({
  open,
  setOpen,
  groupId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: string;
}) => {
  const { usersGroupsEdit, loading } = useUsersGroupsEdit();
  const { toast } = useToast();
  const { form } = useUsersGroupForm();
  const { usersGroups } = useUsersGroup();

  const currentGroup: IUserGroup | undefined = usersGroups?.find(
    (data) => data._id === groupId,
  );

  useEffect(() => {
    if (currentGroup) {
      const { name, description, memberIds } = currentGroup || {};
      form.reset({ name, description, memberIds });
    }
  }, [currentGroup]);

  const onSubmit = (data: IUsersGroupFormSchema) => {
    usersGroupsEdit({
      variables: {
        id: groupId,
        ...data,
      },
      onCompleted: () => {
        toast({ title: 'Updated a group', variant: 'success' });
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <UsersGroupFormFields form={form} />
        <Button type="submit" className="ml-auto" disabled={loading}>
          {loading ? <Spinner /> : 'Update'}
        </Button>
      </form>
    </Form>
  );
};

export const UsersGroupMain = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header className="flex-row">
          <Dialog.Title className="flex items-center gap-2">
            <IconUsersPlus size={16} />
            Add group
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Add a new users group to the system.
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-3"
            >
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        <UsersGroupCreateForm open={open} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
  );
};

export const EditUsersGroups = ({
  children,
  groupId,
}: {
  children: React.ReactNode;
  groupId: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header className="flex-row">
          <Dialog.Title className="flex items-center gap-2">
            <IconUsersPlus size={16} />
            Edit group
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Edit a new users group to the system.
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-3"
            >
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        <UsersGroupEditForm groupId={groupId} open={open} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
  );
};

export const UsersGroupModal = Object.assign(UsersGroupMain, {
  Create: UsersGroupMain,
  Edit: EditUsersGroups,
});
