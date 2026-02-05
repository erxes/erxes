import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { PERMISSION_GROUP_SCHEMA } from '@/settings/permissions/schemas/permissionGroup';
import { Input } from 'erxes-ui';
import { Button } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { IPermissionGroupPermission } from '@/settings/permissions/types';

export const PermissionGroupForm = () => {
  const form = useForm<IPermissionGroupSchema>({
    resolver: zodResolver(PERMISSION_GROUP_SCHEMA),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  return <div>13</div>;
};
