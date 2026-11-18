import { PosSaveAction } from '@/pos/components/pos-edit/PosSaveAction';
import { Infos } from '@/pos/components/appearance/Infos';
import { LogosAndFavicon } from '@/pos/components/appearance/LogosAndFavicon';
import { MainColors } from '@/pos/components/appearance/MainColors';
import { mutations } from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { cleanData } from '@/pos/utils/cleanData';
import { useMutation } from '@apollo/client';
import { Form, toast } from 'erxes-ui';
import { PosSettingsSection } from '@/pos/components/pos-edit/PosSettingsSection';
import { useCallback, useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

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
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
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
          title: t('error'),
          description: t('pos-id-required'),
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
          title: t('success'),
          description: t('appearance-saved'),
        });
        reset(data);
      } catch {
        toast({
          title: t('error'),
          description: t('failed-to-save-appearance'),
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
      <PosSaveAction
        isDirty={isDirty}
        saving={saving}
        form={APPEARANCE_FORM_ID}
      />,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  const renderContent = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 @2xl:grid-cols-4">
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
            {t('failed-to-load-pos-details')}: {error.message}
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
          <PosSettingsSection
            title={t('logos-and-favicon')}
            description={labels.logosDescription}
          >
            <LogosAndFavicon control={control} posType={posType} />
          </PosSettingsSection>

          <PosSettingsSection
            separated
            title={t('main-colors')}
            description={labels.colorsDescription}
          >
            <MainColors control={control} />
          </PosSettingsSection>

          <PosSettingsSection
            separated
            title={t('infos')}
            description={labels.infosDescription}
          >
            <Infos control={control} />
          </PosSettingsSection>
        </form>
      </Form>
    );
  };

  return <>{renderContent()}</>;
};

export { Appearance };
