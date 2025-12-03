import { usePipelineConfigForm } from '@/pipelines/components/configs/hooks/usePipelineConfigForm';
import { TPipelineConfig } from '@/pipelines/types';
import { Button, Form, Sheet, Spinner, toast, useQueryState } from 'erxes-ui';
import { SubmitHandler } from 'react-hook-form';
import { useSaveTicketsConfig } from '../hooks/useSaveTicketsConfig';
import { useCallback } from 'react';
import { ConfigsForm } from './ConfigsForm';
import { useGetTicketConfigDetail } from '../hooks/useGetTicketConfigDetail';

export const ConfigDetails = () => {
  const [configId, setConfigId] = useQueryState('configId');
  const { ticketConfigDetail } = useGetTicketConfigDetail({
    variables: {
      id: configId,
    },
    skip: !configId,
  });
  const { saveTicketsConfig, loading } = useSaveTicketsConfig();
  const { methods } = usePipelineConfigForm();

  const { handleSubmit, reset } = methods;

  const handleClose = useCallback(() => {
    reset();
    setConfigId(null);
  }, [reset, setConfigId]);

  const onSubmit: SubmitHandler<TPipelineConfig> = useCallback(
    (data) => {
      saveTicketsConfig({
        variables: {
          input: data,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Tickets config saved successfully',
            variant: 'success',
          });
          handleClose();
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    },
    [saveTicketsConfig, handleClose],
  );

  return (
    <Sheet
      open={!!configId}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-0 size-full box-border overflow-hidden"
          >
            <Sheet.Header>
              <Sheet.Title>Messenger Configuration</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex-1 size-full flex flex-col px-5 py-4 space-y-4 overflow-y-auto hide-scroll styled-scroll">
              <ConfigsForm form={methods} defaultValues={ticketConfigDetail} />
            </Sheet.Content>
            <Sheet.Footer className="shrink-0">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
