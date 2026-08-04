import { IconShieldCog } from '@tabler/icons-react';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  useToast,
} from 'erxes-ui';
import React from 'react';
import { useAtom } from 'jotai';
import { editingAppAtom } from '../state';
import { useAppsForm } from '../hooks/useAppsForm';
import { useAppsEdit } from '../hooks/useAppsEdit';
import { SubmitHandler } from 'react-hook-form';
import { AppsForm } from './AppsForm';
import { TAppsForm } from '../hooks/useAppsForm';

export const EditApp = () => {
  const { toast } = useToast();
  const [editingApp, setEditingApp] = useAtom(editingAppAtom);
  const { appsEdit, loading } = useAppsEdit();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useAppsForm({ name: editingApp?.name });

  React.useEffect(() => {
    if (editingApp) {
      reset({ name: editingApp.name });
    }
  }, [editingApp, reset]);

  const onClose = () => {
    reset();
    setEditingApp(null);
  };

  const submitHandler: SubmitHandler<TAppsForm> = React.useCallback(
    async (data) => {
      if (!editingApp) return;
      appsEdit({
        variables: { _id: editingApp._id, ...data },
        onCompleted: () => {
          toast({ variant: 'success', title: 'App updated successfully' });
          onClose();
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [appsEdit, editingApp, toast],
  );

  return (
    <Sheet open={!!editingApp} onOpenChange={(open) => !open && onClose()}>
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <IconShieldCog />
              <Sheet.Title>Edit App</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <AppsForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'secondary'} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Update'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
