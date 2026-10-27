import { useTranslation } from 'react-i18next';
import { IconFolder, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Sheet,
  Spinner,
  useScopedHotkeys,
  useToast,
} from 'erxes-ui';
import { useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { SubmitHandler } from 'react-hook-form';
import { useDepartmentForm } from '../../hooks/useDepartmentForm';
import {
  useDepartmentAdd,
  useDepartmentEdit,
} from '../../hooks/useDepartmentActions';
import { useDepartmentCreateSheet } from '../../hooks/useStructureCreateSheet';
import { DepartmentHotKeyScope, TDepartmentForm } from '../../types/department';
import { DepartmentForm } from './DepartmentForm';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateDepartment = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const {
    methods,
    methods: { handleSubmit },
  } = useDepartmentForm();
  const { target, isOpen, openSheet, closeSheet } = useDepartmentCreateSheet();
  const { handleAdd, loading } = useDepartmentAdd();
  const { handleEdit } = useDepartmentEdit();
  const { toast } = useToast();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageDepartments =
    isLoaded && hasActionPermission('departmentsManage');
  const presetParentId = target?.parentId;

  // A chart "+" opens the sheet with its parent already chosen
  useEffect(() => {
    methods.setValue('parentId', presetParentId ?? '');
  }, [presetParentId, methods]);

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageDepartments) return;
      openSheet();
    },
    DepartmentHotKeyScope.DepartmentSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => closeSheet(),
    DepartmentHotKeyScope.DepartmentAddSheet,
  );

  const showError = (error: ApolloError) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });

  const submitHandler: SubmitHandler<TDepartmentForm> = (data) => {
    const insertBefore = target?.insertBefore;

    handleAdd({
      variables: data,
      onCompleted: ({ departmentsAdd }) => {
        if (insertBefore) {
          // The backend rebuilds `order` from the code, so it must be sent
          handleEdit({
            variables: {
              id: insertBefore._id,
              code: insertBefore.code,
              parentId: departmentsAdd._id,
            },
            onError: showError,
          });
        }
        toast({
          title: t('success'),
          variant: 'success',
          description: t('department-created'),
        });
        methods.reset();
        closeSheet();
      },
      onError: showError,
    });
  };
  return (
    <Sheet
      onOpenChange={(open) => (open ? openSheet() : closeSheet())}
      open={isOpen}
    >
      <Can action="departmentsManage">
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus /> {t('create-department')}
            <Kbd>C</Kbd>
          </Button>
        </Sheet.Trigger>
      </Can>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                <IconFolder size={16} />
                {t('create-department-title')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <DepartmentForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={closeSheet}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
