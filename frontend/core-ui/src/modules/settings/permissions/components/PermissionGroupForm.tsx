import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { PERMISSION_GROUP_SCHEMA } from '@/settings/permissions/schemas/permissionGroup';
import { Input, Spinner } from 'erxes-ui';
import { Button } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { IPermissionGroupPermission } from '@/settings/permissions/types';
import { useGetPermissionModules } from '../hooks/useGetPermissionModules';

export const PermissionGroupForm = ({
  onSubmit,
}: {
  onSubmit: (data: IPermissionGroupSchema) => void;
}) => {
  const { permissionModules, loading: permissionModulesLoading } =
    useGetPermissionModules();

  if (permissionModulesLoading) {
    return <Spinner />;
  }
  const form = useForm<IPermissionGroupSchema>({
    resolver: zodResolver(PERMISSION_GROUP_SCHEMA),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  console.log(permissionModules);

  return <div>13</div>;
};
