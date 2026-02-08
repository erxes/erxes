import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Separator, Button } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { PERMISSION_GROUP_SCHEMA } from '@/settings/permissions/schemas/permissionGroup';
import { PermissionModulesForm } from './PermissionModulesForm';

const EMPTY_DEFAULTS: IPermissionGroupSchema = {
  name: '',
  description: '',
  permissions: [],
};

export const PermissionGroupForm = ({
  onSubmit,
  defaultValues,
  isSubmitting,
}: {
  onSubmit?: (data: IPermissionGroupSchema) => void;
  /** Initial form data (e.g. when editing a group or using a default group template). Use a stable key on the form when switching context so it remounts with new defaults. */
  defaultValues?: Partial<IPermissionGroupSchema>;
  isSubmitting?: boolean;
}) => {
  const form = useForm<IPermissionGroupSchema>({
    resolver: zodResolver(PERMISSION_GROUP_SCHEMA),
    defaultValues: {
      ...EMPTY_DEFAULTS,
      ...defaultValues,
      permissions: defaultValues?.permissions ?? EMPTY_DEFAULTS.permissions,
    },
  });

  const handleSubmit = (data: IPermissionGroupSchema) => {
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col h-full w-full"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="w-full px-6 sm:px-8 py-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item className="flex-1 min-w-0">
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Group name"
                      className="w-full"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item className="flex-1 min-w-0">
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Description"
                      className="w-full"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
        <Separator />
        <div className="h-full flex-1 min-h-0">
          <PermissionModulesForm form={form} />
        </div>
        <div className="px-6 sm:px-8 py-4 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
