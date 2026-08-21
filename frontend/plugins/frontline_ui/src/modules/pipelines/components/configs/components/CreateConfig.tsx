import { useCallback, useEffect } from 'react';
import { Button, Form, Sheet, Spinner, toast } from 'erxes-ui';
import { usePipelineConfigForm } from '../hooks/usePipelineConfigForm';
import { useSaveTicketsConfig } from '../hooks/useSaveTicketsConfig';
import { type UseFormReturn, type SubmitHandler } from 'react-hook-form';
import { type TPipelineConfig } from '@/pipelines/types';
import { useAtom } from 'jotai';
import { configCreateModalAtom } from '../states';
import { ConfigsForm } from './ConfigsForm';
import { useTranslation } from 'react-i18next';

const CreateConfigSheetForm = ({
  methods,
  loading,
  onSubmit,
  onCancel,
}: {
  methods: UseFormReturn<TPipelineConfig>;
  loading: boolean;
  onSubmit: SubmitHandler<TPipelineConfig>;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col gap-0 size-full box-border overflow-hidden"
      >
        <Sheet.Header>
          <Sheet.Title>{t('new-configuration')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 w-full flex flex-col px-5 py-4 space-y-4 overflow-y-auto hide-scroll styled-scroll">
          <ConfigsForm form={methods} />
        </Sheet.Content>
        <Sheet.Footer className="shrink-0">
          <Button variant="ghost" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : t('add')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const CreateConfig = () => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useAtom(configCreateModalAtom);
  const { saveTicketsConfig, loading } = useSaveTicketsConfig();
  const { methods } = usePipelineConfigForm();

  const { reset } = methods;

  const onSubmit: SubmitHandler<TPipelineConfig> = useCallback(
    (data) => {
      saveTicketsConfig({
        variables: {
          input: data,
        },
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('tickets-config-saved-successfully'),
            variant: 'success',
          });
          reset();
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    },
    [saveTicketsConfig, reset, setOpen, t],
  );

  useEffect(() => {
    methods.setFocus('name');
  }, [methods]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.View className="p-0 max-w-xl">
        <CreateConfigSheetForm
          methods={methods}
          loading={loading}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </Sheet.View>
    </Sheet>
  );
};
