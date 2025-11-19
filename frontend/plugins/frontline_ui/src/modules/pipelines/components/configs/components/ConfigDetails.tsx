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
import { SubmitHandler, useWatch } from 'react-hook-form';
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

  const { handleSubmit, reset, control } = methods;
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
              reset();
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
        console.error(error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
    [saveTicketsConfig, reset, confirm],
  );

  return (
    <Sheet open={!!configId} onOpenChange={setConfigId}>
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
              <Button variant="ghost" onClick={() => setConfigId(undefined)}>
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
