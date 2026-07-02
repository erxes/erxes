import { Sheet, Button, toast, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { posInEbarimtDetailAtom } from '@/ebarimt/settings/pos-in-ebarimt-config/states/posInEbarimtConfigStates';
import {
  addEBarimtPosInConfigSchema,
  normalizeRuleIds,
  TPosInEbarimtConfig,
} from '@/ebarimt/settings/pos-in-ebarimt-config/types';
import { useSavePosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useSavePosInEbarimtConfig';
import { PosInEBarimtConfigFormFields } from './PosInEBarimtConfigFormFields';
import { useTranslation } from 'react-i18next';

const FORM_ID = 'edit-pos-in-ebarimt-form';

export const EditPosInEBarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useQueryState<string>('pos_in_ebarimt_id');
  const [detail, setDetail] = useAtom(posInEbarimtDetailAtom);
  const { savePosInEbarimtConfig } = useSavePosInEbarimtConfig();

  const form = useForm<TPosInEbarimtConfig>({
    resolver: zodResolver(addEBarimtPosInConfigSchema),
    defaultValues: {
      title: '',
      posId: '',
      posNo: '10003424',
      companyName: '',
      companyRD: '',
      merchantTin: '',
      branchOfProvince: '',
      subProvince: '',
      districtCode: '',
      defaultUnitedCode: '',
      branchNo: '',
      hasVat: false,
      vatPercent: '',
      reverseVatRules: [],
      hasCitytax: false,
      citytaxPercent: '',
      reverseCtaxRules: [],
      headerText: '',
      footerText: '',
      withDescription: false,
      skipEbarimt: false,
      ebarimtUrl: '',
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (detail) {
      reset({
        title: detail.title || '',
        posId: detail.posId || '',
        posNo: detail.posNo || '10003424',
        companyName: detail.companyName || '',
        companyRD: detail.companyRD || '',
        merchantTin: detail.merchantTin || '',
        branchOfProvince: detail.branchOfProvince || '',
        subProvince: detail.subProvince || '',
        districtCode: detail.districtCode || '',
        defaultUnitedCode: detail.defaultUnitedCode || '',
        branchNo: detail.branchNo || '',
        hasVat: detail.hasVat || false,
        vatPercent: detail.vatPercent || '',
        reverseVatRules: normalizeRuleIds(detail.reverseVatRules),
        hasCitytax: detail.hasCitytax || false,
        citytaxPercent: detail.citytaxPercent || '',
        reverseCtaxRules: normalizeRuleIds(detail.reverseCtaxRules),
        headerText: detail.headerText || '',
        footerText: detail.footerText || '',
        withDescription: detail.withDescription || false,
        skipEbarimt: detail.skipEbarimt || false,
        ebarimtUrl: detail.ebarimtUrl || '',
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

  const handleSubmit = async (data: TPosInEbarimtConfig) => {
    if (!detail) return;
    try {
      await savePosInEbarimtConfig(data, 'update', detail._id);
      setOpen(null);
      setDetail(null);
      reset();
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
    }
  };

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
          <Sheet.Title>{t('edit-pos-in-ebarimt-config')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <PosInEBarimtConfigFormFields
            form={form}
            onSubmit={handleSubmit}
            formId={FORM_ID}
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
          <Button type="submit" form={FORM_ID} size="lg">
            {t('save')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
