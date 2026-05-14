import { Sheet, Button, Spinner, toast, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addEBarimtStageInConfigSchema, TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { stageInEbarimtDetailAtom } from '@/ebarimt/settings/stage-in-ebarimt-config/states/stageInEbarimtConfigStates';
import { useSaveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useSaveStageInEbarimtConfig';
import { useEbarimtConfigState } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useEbarimtConfigState';
import { StageInEBarimtConfigFormFields } from './StageInEBarimtConfigFormFields';

const FORM_ID = 'edit-stage-in-ebarimt-form';

export const EditStageInEBarimtConfig = () => {
  const [open, setOpen] = useQueryState<string>('stage_in_ebarimt_id');
  const [detail, setDetail] = useAtom(stageInEbarimtDetailAtom);
  const { saveStageInEbarimtConfig } = useSaveStageInEbarimtConfig();
  const { getConfigByStageId } = useEbarimtConfigState();
  const [loading, setLoading] = useState(false);

  const form = useForm<TStageInEbarimtConfig>({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: {
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
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (detail) {
      reset({
        title: detail.title || '',
        boardId: detail.boardId || '',
        pipelineId: detail.pipelineId || '',
        stageId: detail.stageId || '',
        posNo: detail.posNo || '',
        companyRD: detail.companyRD || '',
        merchantTin: detail.merchantTin || '',
        branchOfProvince: detail.branchOfProvince || '',
        subProvince: detail.subProvince || '',
        districtCode: detail.districtCode || '',
        companyName: detail.companyName || '',
        defaultUnitedCode: detail.defaultUnitedCode || '',
        branchNo: detail.branchNo || '',
        hasVat: detail.hasVat || false,
        citytaxPercent: detail.citytaxPercent || '',
        vatPercent: detail.vatPercent || '',
        reverseVatRules: detail.reverseVatRules || '',
        hasCitytax: detail.hasCitytax || false,
        footerText: detail.footerText || '',
        reverseCtaxRules: detail.reverseCtaxRules || '',
        withDescription: detail.withDescription || false,
        skipEbarimt: detail.skipEbarimt || false,
        headerText: detail.headerText || '',
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

  const handleSubmit = async (data: TStageInEbarimtConfig) => {
    if (!detail) return;
    try {
      setLoading(true);
      const existingConfig = getConfigByStageId(data.stageId);
      await saveStageInEbarimtConfig(data, 'update', existingConfig?._id || detail._id);
      setOpen(null);
      setDetail(null);
      reset();
    } catch {
      toast({ title: 'Error', description: 'Failed to save configuration', variant: 'destructive' });
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
    <Sheet open={open !== null} onOpenChange={handleClose}>
      <Sheet.View side="right" className="bg-background sm:max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>Edit Stage In Ebarimt Config</Sheet.Title>
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
