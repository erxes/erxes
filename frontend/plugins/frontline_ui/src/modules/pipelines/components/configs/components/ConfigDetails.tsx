import { usePipelineConfigForm } from '@/pipelines/components/configs/hooks/usePipelineConfigForm';
import { TPipelineConfig } from '@/pipelines/types';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  toast,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
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

  const confirmationValue = 'save';
  const { confirm } = useConfirm();
  const { handleSubmit, reset } = methods;

  const handleClose = useCallback(() => {
    reset();
    setConfigId(null);
  }, [reset, setConfigId]);

  const onSubmit: SubmitHandler<TPipelineConfig> = useCallback(
    (data) => {
      try {
        confirm({
          message: 'Are you sure you want to save the tickets config?',
          options: {
            confirmationValue,
          },
        }).then(() => {
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
        });
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      }
    },
    [saveTicketsConfig, confirm, handleClose],
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
            className="flex flex-col gap-0 size-full box-border"
          >
            <Sheet.Header>
              <Sheet.Title>Pipeline Configuration</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4 space-y-4">
              <ConfigsForm form={methods} defaultValues={ticketConfigDetail} />
            </Sheet.Content>
            <Sheet.Footer>
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
