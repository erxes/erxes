import { Sheet, Button, Spinner, toast } from 'erxes-ui';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { addEBarimtReturnConfigSchema } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types/addEBarimtReturnConfigSchema';
import { TReturnEbarimtConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types';
import { useEbarimtReturnConfigSave } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useEbarimtReturnConfigSave';
import { ReturnEBarimtConfigFormFields } from './ReturnEBarimtConfigFormFields';

const FORM_ID = 'add-return-ebarimt-form';

export const AddReturnEBarimtConfig = () => {
  const [open, setOpen] = useState(false);
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

  const handleSubmit = async (data: TReturnEbarimtConfig) => {
    try {
      await saveConfigsToServer(data, 'create');
      setOpen(false);
      form.reset();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create configuration',
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
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Config
        </Button>
      </Sheet.Trigger>
      <Sheet.View side="right" className="bg-background sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Add Return Ebarimt Config</Sheet.Title>
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
