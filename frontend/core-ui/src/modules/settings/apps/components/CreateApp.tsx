import { IconPlus, IconShieldCog } from '@tabler/icons-react';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  useToast,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppsForm } from '../hooks/useAppsForm';
import { useAppsAdd } from '../hooks/useAppsAdd';
import { SubmitHandler } from 'react-hook-form';
import { AppsForm } from './AppsForm';
import { TAppsForm } from '../hooks/useAppsForm';

export const CreateApp = () => {
  const { t } = useTranslation('settings');
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
            title: t('apps.created-successfully', 'App created successfully'),
          });
          reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: t('error', 'Error'),
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
          {t('apps.create', 'Create App')}
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
              <Sheet.Title>{t('apps.create', 'Create App')}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <AppsForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'secondary'} onClick={() => setOpen(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('apps.create', 'Create App')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
