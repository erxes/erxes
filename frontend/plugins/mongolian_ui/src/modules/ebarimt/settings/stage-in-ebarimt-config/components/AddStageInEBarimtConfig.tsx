import { Sheet, Button, Spinner, toast } from 'erxes-ui';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { addEBarimtStageInConfigSchema, TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { useSaveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useSaveStageInEbarimtConfig';
import { StageInEBarimtConfigFormFields } from './StageInEBarimtConfigFormFields';

const FORM_ID = 'add-stage-in-ebarimt-form';

const DEFAULT_VALUES: TStageInEbarimtConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  posNo: '',
  companyRD: '',
  merchantTin: '',
  branchOfProvince: '',
  subProvince: '',
  districtCode: '',
  companyName: '',
  defaultUnitedCode: '',
  branchNo: '',
  hasVat: false,
  citytaxPercent: '',
  vatPercent: '',
  reverseVatRules: '',
  hasCitytax: false,
  footerText: '',
  reverseCtaxRules: '',
  withDescription: false,
  skipEbarimt: false,
  headerText: '',
};

export const AddStageInEBarimtConfig = () => {
  const [open, setOpen] = useState(false);
  const { saveStageInEbarimtConfig } = useSaveStageInEbarimtConfig();
  const [loading, setLoading] = useState(false);

  const form = useForm<TStageInEbarimtConfig>({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const handleSubmit = async (data: TStageInEbarimtConfig) => {
    try {
      setLoading(true);
      await saveStageInEbarimtConfig(data, 'create');
      setOpen(false);
      form.reset(DEFAULT_VALUES);
    } catch {
      toast({ title: 'Error', description: 'Failed to create configuration', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleBoardChange = useCallback(
    (value: string | string[]) => {
      form.setValue('boardId', Array.isArray(value) ? value[0] : value);
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

  const handleBranchChange = useCallback(
    (value: string) => {
      form.setValue('branchOfProvince', value);
      form.setValue('subProvince', '');
      form.setValue('districtCode', '');
    },
    [form],
  );

  const handleSubBranchChange = useCallback(
    (value: string) => {
      form.setValue('subProvince', value);
    },
    [form],
  );

  const memoizedSetValue = useCallback(
    (name: string, value: any) => {
      form.setValue(name as any, value);
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
      <Sheet.View side="right" className="bg-background sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>Add Stage In Ebarimt Config</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <StageInEBarimtConfigFormFields
            form={form}
            onSubmit={handleSubmit}
            formId={FORM_ID}
            onBoardChange={handleBoardChange}
            onPipelineChange={handlePipelineChange}
            onBranchChange={handleBranchChange}
            onSubBranchChange={handleSubBranchChange}
            onSetValue={memoizedSetValue}
          />
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">Cancel</Button>
          </Sheet.Close>
          <Button type="submit" form={FORM_ID} size="lg" disabled={loading}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
