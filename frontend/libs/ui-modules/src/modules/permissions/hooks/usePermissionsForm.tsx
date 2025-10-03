import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PERMISSION_FORM_SCHEMA } from 'ui-modules/modules/permissions/shemas/permission-create-form';
import { IPermissionFormSchema } from 'ui-modules/modules/permissions/types/permission';

export const usePermissionsForm = () => {
  const form = useForm<IPermissionFormSchema>({
    mode: 'onBlur',
    resolver: zodResolver(PERMISSION_FORM_SCHEMA),
    defaultValues: {
      allowed: true,
    },
  });

  return {
    form,
  };
};
