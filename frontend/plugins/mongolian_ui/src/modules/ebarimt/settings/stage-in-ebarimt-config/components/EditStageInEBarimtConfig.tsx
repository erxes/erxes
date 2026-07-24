import { Sheet, Button, Spinner, toast, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useEffect, useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import {
  addEBarimtStageInConfigSchema,
  normalizeRuleIds,
  TStageInEbarimtConfig,
} from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { useSaveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useSaveStageInEbarimtConfig';
import { StageInEBarimtConfigFormFields } from './StageInEBarimtConfigFormFields';

const FORM_ID = 'edit-stage-in-ebarimt-form';

export const EditStageInEBarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useQueryState<string>('stage_in_ebarimt_id');
  const { saveStageInEbarimtConfig } = useSaveStageInEbarimtConfig();
  const [loading, setLoading] = useState(false);

  const { data } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'stageInEbarimt' },
    skip: !open,
  });

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
      reverseVatRules: [],
      hasCitytax: false,
      footerText: '',
      reverseCtaxRules: [],
      withDescription: false,
      skipEbarimt: false,
      headerText: '',
    },
  });

  const { reset } = form;

  // Populate the form once per config id. Depending on the resolved config
  // object would re-run reset on every Apollo `data` reference change and wipe
  // the user's in-progress edits, so we track the loaded id via a ref instead.
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      loadedIdRef.current = null;
      return;
    }
    if (loadedIdRef.current === open) return;

    const config = (data?.mnConfigs || []).find((c: any) => c._id === open);
    if (!config) return;

    const detail =
      typeof config.value === 'string'
        ? JSON.parse(config.value)
        : config.value || {};
    loadedIdRef.current = open;

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
      reverseVatRules: normalizeRuleIds(detail.reverseVatRules),
      hasCitytax: detail.hasCitytax || false,
      footerText: detail.footerText || '',
      reverseCtaxRules: normalizeRuleIds(detail.reverseCtaxRules),
      withDescription: detail.withDescription || false,
      skipEbarimt: detail.skipEbarimt || false,
      headerText: detail.headerText || '',
    });
  }, [open, data, reset]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(null);
      reset();
    }
  };

  const handleSubmit = async (data: TStageInEbarimtConfig) => {
    if (!open) return;
    try {
      setLoading(true);
      await saveStageInEbarimtConfig(data, 'update', open);
      setOpen(null);
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
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
      const branchCode = form.getValues('branchOfProvince');
      form.setValue('districtCode', branchCode ? `${branchCode}${value}` : '');
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
          <Sheet.Title>{t('edit-stage-in-ebarimt-config')}</Sheet.Title>
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
            <Button variant="outline" size="lg">
              {t('cancel')}
            </Button>
          </Sheet.Close>
          <Button type="submit" form={FORM_ID} size="lg" disabled={loading}>
            {loading ? <Spinner /> : t('save')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
