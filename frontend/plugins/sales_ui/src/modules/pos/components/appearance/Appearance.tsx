import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { LogosAndFavicon } from '@/pos/components/appearance/LogosAndFavicon';
import { MainColors } from '@/pos/components/appearance/MainColors';
import { Infos } from '@/pos/components/appearance/Infos';
import { isFieldVisible } from '@/pos/constants';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { cleanData } from '@/pos/utils/cleanData';

interface AppearanceProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface AppearanceFormData {
  logo: string;
  bgImage: string;
  favIcon: string;
  receiptIcon: string;
  kioskHeaderImage: string;
  mobileAppImage: string;
  qrCodeImage: string;
  bodyColor: string;
  headerColor: string;
  footerColor: string;
  website: string;
  phone: string;
}

const APPEARANCE_FORM_ID = 'pos-appearance-form';

const DEFAULT_FORM_VALUES: AppearanceFormData = {
  logo: '',
  bgImage: '',
  favIcon: '',
  receiptIcon: '',
  kioskHeaderImage: '',
  mobileAppImage: '',
  qrCodeImage: '',
  bodyColor: '#FFFFFF',
  headerColor: '#6569DF',
  footerColor: '#3CCC38',
  website: '',
  phone: '',
};

const Appearance: React.FC<AppearanceProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<AppearanceFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  useEffect(() => {
    if (!posDetail?.uiOptions) {
      return;
    }

    const uiOptions = posDetail.uiOptions;
    const colors = uiOptions.colors || {};
    const texts = uiOptions.texts || {};

    reset({
      logo: uiOptions.logo || '',
      bgImage: uiOptions.bgImage || '',
      favIcon: uiOptions.favIcon || '',
      receiptIcon: uiOptions.receiptIcon || '',
      kioskHeaderImage: uiOptions.kioskHeaderImage || '',
      mobileAppImage: uiOptions.mobileAppImage || '',
      qrCodeImage: uiOptions.qrCodeImage || '',
      bodyColor: colors.bodyColor || '#FFFFFF',
      headerColor: colors.headerColor || '#6569DF',
      footerColor: colors.footerColor || '#3CCC38',
      website: texts.website || '',
      phone: texts.phone || '',
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: AppearanceFormData) => {
      if (!posId) {
        toast({
          title: 'Error',
          description: 'POS ID is required',
          variant: 'destructive',
        });
        return;
      }

      try {
        const existingUiOptions = cleanData(posDetail?.uiOptions || {});

        await posEdit({
          variables: {
            _id: posId,
            uiOptions: {
              ...existingUiOptions,
              logo: data.logo,
              bgImage: data.bgImage,
              favIcon: data.favIcon,
              receiptIcon: data.receiptIcon,
              kioskHeaderImage: data.kioskHeaderImage,
              mobileAppImage: data.mobileAppImage,
              qrCodeImage: data.qrCodeImage,
              colors: {
                bodyColor: data.bodyColor,
                headerColor: data.headerColor,
                footerColor: data.footerColor,
              },
              texts: {
                website: data.website,
                phone: data.phone,
              },
            },
          },
        });

        toast({
          title: 'Success',
          description: 'Appearance settings saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save appearance settings',
          variant: 'destructive',
        });
      }
    },
    [posDetail?.uiOptions, posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={APPEARANCE_FORM_ID}
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
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-20 h-4 rounded animate-pulse bg-muted" />
                <div className="w-full h-28 rounded-md animate-pulse bg-muted" />
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
          id={APPEARANCE_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          <section className="space-y-4">
            <Label>Logos and favicon</Label>

            <LogosAndFavicon control={control} posType={posType} />
          </section>

          {isFieldVisible('mainColors', posType) && (
            <section className="pt-6 space-y-4 border-t">
              <Label>Main colors</Label>

              <MainColors control={control} />
            </section>
          )}

          {isFieldVisible('websitePhone', posType) && (
            <section className="pt-6 space-y-4 border-t">
              <Label>Infos</Label>

              <Infos control={control} />
            </section>
          )}
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title="Appearance configuration">
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Appearance;
