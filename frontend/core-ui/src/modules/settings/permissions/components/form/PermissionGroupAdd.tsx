// import { zodResolver } from '@hookform/resolvers/zod';
import { FocusSheet, Sheet } from 'erxes-ui';
import { Button } from 'erxes-ui';
// import { PERMISSION_GROUP_SCHEMA } from '@/settings/permissions/schemas/permissionGroup';
// import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { PermissionGroupForm } from './PermissionGroupForm';

export const PermissionGroupAdd = ({ text }: { text?: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  //   const form = useForm<typeof PERMISSION_GROUP_SCHEMA>({
  //     resolver: zodResolver(PERMISSION_GROUP_SCHEMA),
  //     defaultValues: {
  //       name: '',
  //       description: '',
  //       permissions: [],
  //     },
  //   });

  //   const onSubmit = (data: IPermissionGroupForm) => {
  //     addPermissionGroup({
  //       variables: {
  //         ...data,
  //       },
  //     });
  //   };

  const onSubmit = (_data: IPermissionGroupSchema) => {
    // TODO: call mutation (e.g. addPermissionGroup) and close sheet
  };

  return (
    <FocusSheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button variant="secondary">{text || 'Add Custom Group'}</Button>
      </Sheet.Trigger>
      <FocusSheet.View>
        <FocusSheet.Header title={'Add Custom Group'} />
        <FocusSheet.Content>
          <PermissionGroupForm onSubmit={onSubmit} />
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
