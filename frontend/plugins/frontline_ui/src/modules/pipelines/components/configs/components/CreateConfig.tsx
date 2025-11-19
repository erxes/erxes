import { useCallback, useEffect } from 'react';
import { Button, Form, Sheet, Spinner, toast, useConfirm } from 'erxes-ui';
import { usePipelineConfigForm } from '../hooks/usePipelineConfigForm';
import { useSaveTicketsConfig } from '../hooks/useSaveTicketsConfig';
import { type SubmitHandler } from 'react-hook-form';
import { type TPipelineConfig } from '@/pipelines/types';
import { useAtom } from 'jotai';
import { configCreateModalAtom } from '../states';
import { ConfigsForm } from './ConfigsForm';

export const CreateConfig = () => {
  const [open, setOpen] = useAtom(configCreateModalAtom);
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
              setOpen(false);
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

  useEffect(() => {
    methods.setFocus('name');
  }, [methods]);

  console.log('watch', methods.watch(), '\nerrors', methods.formState.errors);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-0 size-full box-border"
          >
            <Sheet.Header>
              <Sheet.Title>New Configuration</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4 space-y-4">
              <ConfigsForm form={methods} />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Add'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
