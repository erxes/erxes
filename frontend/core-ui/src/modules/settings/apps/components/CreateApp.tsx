import { IconPlus, IconShieldCog } from '@tabler/icons-react';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  useToast,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useAppsForm } from '../hooks/useAppsForm';
import { useAppsAdd } from '../hooks/useAppsAdd';
import { SubmitHandler } from 'react-hook-form';
import { AppsForm } from './AppsForm';
import { TAppsForm } from '../hooks/useAppsForm';

export const CreateApp = () => {
  const { toast } = useToast();
  const { appsAdd, loading } = useAppsAdd();
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useAppsForm();

  const [open, setOpen] = useState<boolean>(false);

  const submitHandler: SubmitHandler<TAppsForm> = React.useCallback(
    async (data) => {
      appsAdd({
        variables: data,
        onCompleted: () => {
          toast({
            variant: 'success',
            title: 'App created successfully',
          });
          reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [appsAdd, toast, reset],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create App
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <IconShieldCog />
              <Sheet.Title>Create App</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <AppsForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'secondary'} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Create App'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
