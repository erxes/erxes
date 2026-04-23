import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { Main } from '@/pos/components/ebarimtConfig/Main';
import { Other } from '@/pos/components/ebarimtConfig/Other';
import { Vat } from '@/pos/components/ebarimtConfig/Vat';
import { UbCityTax } from '@/pos/components/ebarimtConfig/UbCityTax';
import { UiConfig } from '@/pos/components/ebarimtConfig/UiConfig';
import { isFieldVisible } from '@/pos/constants';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { cleanData } from '@/pos/utils/cleanData';

interface EbarimtConfigProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface EbarimtConfigFormData {
  companyName: string;
  ebarimtUrl: string;
  checkTaxpayerUrl: string;
  companyRD: string;
  merchantTin: string;
  posNo: string;
  districtCode: string;
  branchNo: string;
  defaultGSCode: string;
  hasVat: boolean;
  vatPercent: string;
  reverseVatRules: string[];
  hasCitytax: boolean;
  cityTaxPercent: string;
  reverseCtaxRules: string[];
  headerText: string;
  footerText: string;
  hasCopy: boolean;
  hasSumQty: boolean;
  isCleanTaxPrice: boolean;
}

const EBARIMT_CONFIG_FORM_ID = 'pos-ebarimt-config-form';

const DEFAULT_FORM_VALUES: EbarimtConfigFormData = {
  companyName: '',
  ebarimtUrl: '',
  checkTaxpayerUrl: '',
  companyRD: '',
  merchantTin: '',
  posNo: '',
  districtCode: '',
  branchNo: '',
  defaultGSCode: '',
  hasVat: false,
  vatPercent: '0',
  reverseVatRules: [],
  hasCitytax: false,
  cityTaxPercent: '0',
  reverseCtaxRules: [],
  headerText: '',
  footerText: '',
  hasCopy: false,
  hasSumQty: false,
  isCleanTaxPrice: false,
};

const EbarimtConfig: React.FC<EbarimtConfigProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<EbarimtConfigFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  useEffect(() => {
    if (!posDetail?.ebarimtConfig) {
      return;
    }

    const config = posDetail.ebarimtConfig;

    reset({
      companyName: config.companyName || '',
      ebarimtUrl: config.ebarimtUrl || '',
      checkTaxpayerUrl: config.checkTaxpayerUrl || '',
      companyRD: config.companyRD || '',
      merchantTin: config.merchantTin || '',
      posNo: config.posNo || '',
      districtCode: config.districtCode || '',
      branchNo: config.branchNo || '',
      defaultGSCode: config.defaultGSCode || '',
      hasVat: config.hasVat ?? false,
      vatPercent: String(config.vatPercent ?? 0),
      reverseVatRules: config.reverseVatRules || [],
      hasCitytax: config.hasCitytax ?? false,
      cityTaxPercent: String(config.cityTaxPercent ?? 0),
      reverseCtaxRules: config.reverseCtaxRules || [],
      headerText: config.headerText || '',
      footerText: config.footerText || '',
      hasCopy: config.hasCopy ?? false,
      hasSumQty: config.hasSumQty ?? false,
      isCleanTaxPrice: config.isCleanTaxPrice ?? false,
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: EbarimtConfigFormData) => {
      if (!posId) {
        toast({
          title: 'Error',
          description: 'POS ID is required',
          variant: 'destructive',
        });
        return;
      }

      const vatPercentNumber = Number(data.vatPercent);
      if (isNaN(vatPercentNumber) || vatPercentNumber < 0) {
        toast({
          title: 'Error',
          description: 'VAT percent must be a valid non-negative number',
          variant: 'destructive',
        });
        return;
      }

      const cityTaxPercentNumber = Number(data.cityTaxPercent);
      if (!Number.isFinite(cityTaxPercentNumber) || cityTaxPercentNumber < 0) {
        toast({
          title: 'Error',
          description:
            'UB City Tax percent must be a valid non-negative number',
          variant: 'destructive',
        });
        return;
      }

      try {
        const existingConfig = cleanData(posDetail?.ebarimtConfig || {});

        await posEdit({
          variables: {
            _id: posId,
            ebarimtConfig: {
              ...existingConfig,
              companyName: data.companyName,
              ebarimtUrl: data.ebarimtUrl,
              checkTaxpayerUrl: data.checkTaxpayerUrl,
              companyRD: data.companyRD,
              merchantTin: data.merchantTin,
              posNo: data.posNo,
              districtCode: data.districtCode,
              branchNo: data.branchNo,
              defaultGSCode: data.defaultGSCode,
              hasVat: data.hasVat,
              vatPercent: vatPercentNumber,
              reverseVatRules: data.reverseVatRules,
              hasCitytax: data.hasCitytax,
              cityTaxPercent: cityTaxPercentNumber,
              reverseCtaxRules: data.reverseCtaxRules,
              headerText: data.headerText,
              footerText: data.footerText,
              hasCopy: data.hasCopy,
              hasSumQty: data.hasSumQty,
              isCleanTaxPrice: data.isCleanTaxPrice,
            },
          },
        });

        toast({
          title: 'Success',
          description: 'Ebarimt config saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save ebarimt config',
          variant: 'destructive',
        });
      }
    },
    [posDetail?.ebarimtConfig, posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={EBARIMT_CONFIG_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  const renderContent = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-24 h-4 rounded animate-pulse bg-muted" />
                <div className="h-10 rounded animate-pulse bg-muted" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-destructive">
            Failed to load POS details: {error.message}
          </p>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form
          id={EBARIMT_CONFIG_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          <section className="space-y-4">
            <Label>Main</Label>
            <Main control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Other</Label>
            <Other control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Vat</Label>
            <Vat control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Ub City Tax</Label>
            <UbCityTax control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Ui Config</Label>
            <UiConfig control={control} />
          </section>
        </form>
      </Form>
    );
  };

  if (!isFieldVisible('ebarimtSetup', posType)) {
    return null;
  }

  return (
    <div className="p-6">
      <InfoCard title="Ebarimt configuration">
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default EbarimtConfig;
