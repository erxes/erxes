import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { Stage } from '@/pos/components/deliveryConfig/Stage';
import { DealUsers } from '@/pos/components/deliveryConfig/DealUsers';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { cleanData } from '@/pos/utils/cleanData';
import { useTranslation } from 'react-i18next';

interface DeliveryConfigProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface DeliveryConfigFormData {
  boardId: string;
  pipelineId: string;
  stageId: string;
  mapCustomField: string;
  watchedUserIds: string[];
  assignedUserIds: string[];
  productId: string;
}

const DELIVERY_CONFIG_FORM_ID = 'pos-delivery-config-form';

const DEFAULT_FORM_VALUES: DeliveryConfigFormData = {
  boardId: '',
  pipelineId: '',
  stageId: '',
  mapCustomField: '',
  watchedUserIds: [],
  assignedUserIds: [],
  productId: '',
};

const DeliveryConfig: React.FC<DeliveryConfigProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { t } = useTranslation('sales');
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<DeliveryConfigFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  useEffect(() => {
    if (!posDetail?.deliveryConfig) {
      return;
    }

    const config = posDetail.deliveryConfig;
    reset({
      boardId: config.boardId || '',
      pipelineId: config.pipelineId || '',
      stageId: config.stageId || '',
      mapCustomField: config.mapCustomField || '',
      watchedUserIds: config.watchedUserIds || [],
      assignedUserIds: config.assignedUserIds || [],
      productId: config.productId || '',
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: DeliveryConfigFormData) => {
      if (!posId) {
        toast({
          title: t('error'),
          description: t('pos-id-required'),
          variant: 'destructive',
        });
        return;
      }

      try {
        const existingConfig = cleanData(posDetail?.deliveryConfig || {});

        await posEdit({
          variables: {
            _id: posId,
            deliveryConfig: {
              ...existingConfig,
              boardId: data.boardId,
              pipelineId: data.pipelineId,
              stageId: data.stageId,
              mapCustomField: data.mapCustomField,
              watchedUserIds: data.watchedUserIds,
              assignedUserIds: data.assignedUserIds,
              productId: data.productId,
            },
          },
        });

        toast({
          title: t('success'),
          description: t('delivery-config-saved'),
        });
        reset(data);
      } catch {
        toast({
          title: t('error'),
          description: t('failed-to-save-delivery-config'),
          variant: 'destructive',
        });
      }
    },
    [posDetail?.deliveryConfig, posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={DELIVERY_CONFIG_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? t('saving') : t('save-changes')}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  const renderContent = () => {
    if (detailLoading) {
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-24 h-4 rounded animate-pulse bg-muted" />
                  <div className="h-8 rounded animate-pulse bg-muted" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="w-32 h-4 rounded animate-pulse bg-muted" />
              <div className="w-48 h-8 rounded animate-pulse bg-muted" />
            </div>
          </div>
          <div className="pt-4 space-y-4 border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-32 h-4 rounded animate-pulse bg-muted" />
                <div className="h-8 rounded animate-pulse bg-muted" />
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
          id={DELIVERY_CONFIG_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          <section className="space-y-4">
            <Label>{t('stage')}</Label>
            <Stage control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>{t('deal-users')}</Label>
            <DealUsers control={control} />
          </section>
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title={t('delivery-configuration')}>
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default DeliveryConfig;
