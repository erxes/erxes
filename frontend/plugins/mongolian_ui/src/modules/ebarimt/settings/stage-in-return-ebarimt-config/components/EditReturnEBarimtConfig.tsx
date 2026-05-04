import { Sheet, Button, Spinner, toast, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addEBarimtReturnConfigSchema } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types/addEBarimtReturnConfigSchema';
import { TReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';
import { returnEbarimtDetailAtom } from '@/ebarimt/settings/stage-in-return-ebarimt-config/states/returnEbarimtConfigStates';
import { useEbarimtReturnConfigSave } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useEbarimtReturnConfigSave';
import { ReturnEBarimtConfigFormFields } from './ReturnEBarimtConfigFormFields';

const FORM_ID = 'edit-return-ebarimt-form';

export const EditReturnEBarimtConfig = () => {
  const [open, setOpen] = useQueryState<string>('return_ebarimt_id');
  const [detail, setDetail] = useAtom(returnEbarimtDetailAtom);
  const { saveConfigsToServer, loading } = useEbarimtReturnConfigSave();

  const form = useForm<TReturnEbarimtConfig>({
    resolver: zodResolver(addEBarimtReturnConfigSchema),
    defaultValues: {
      title: '',
      destinationStageBoard: '',
      pipelineId: '',
      stageId: '',
      userEmail: '',
      hasVat: false,
      hasCitytax: false,
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (detail) {
      reset({
        title: detail.title || '',
        destinationStageBoard: detail.destinationStageBoard || '',
        pipelineId: detail.pipelineId || '',
        stageId: detail.stageId || '',
        userEmail: detail.userEmail || '',
        hasVat: detail.hasVat || false,
        hasCitytax: detail.hasCitytax || false,
      });
    }
  }, [detail, reset]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null);
      setDetail(null);
      reset();
    }
  };

  const handleSubmit = async (data: TReturnEbarimtConfig) => {
    if (!detail) return;
    try {
      await saveConfigsToServer(data, 'update', detail._id);
      setOpen(null);
      setDetail(null);
      reset();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  const handleBoardChange = useCallback(
    (value: string | string[]) => {
      form.setValue('destinationStageBoard', Array.isArray(value) ? value[0] : value);
      form.setValue('pipelineId', '');
      form.setValue('stageId', '');
    },
    [form],
  );

  const handlePipelineChange = useCallback(
    (value: string | string[]) => {
      form.setValue('pipelineId', Array.isArray(value) ? value[0] : value);
      form.setValue('stageId', '');
    },
    [form],
  );

  return (
    <Sheet open={open !== null} onOpenChange={handleClose}>
      <Sheet.View side="right" className="bg-background sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Edit Return Ebarimt Config</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ReturnEBarimtConfigFormFields
            form={form}
            onSubmit={handleSubmit}
            formId={FORM_ID}
            onBoardChange={handleBoardChange}
            onPipelineChange={handlePipelineChange}
          />
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Sheet.Close>
          <Button type="submit" form={FORM_ID} size="lg" disabled={loading}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
