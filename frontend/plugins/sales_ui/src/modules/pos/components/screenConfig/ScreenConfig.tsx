import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { KitchenScreen } from '@/pos/components/screenConfig/KitchenScreen';
import { WaitingScreen } from '@/pos/components/screenConfig/WaitingScreen';
import { PrintConfig } from '@/pos/components/screenConfig/PrintConfig';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

interface ScreenConfigProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface ScreenConfigFormData {
  kitchenIsActive: boolean;
  kitchenShowType: string;
  kitchenType: string;
  kitchenValue: string;
  kitchenIsPrint: boolean;
  waitingIsActive: boolean;
  waitingType: string;
  waitingValue: string;
  waitingContentUrl: string;
  waitingIsPrint: boolean;
}

const SCREEN_CONFIG_FORM_ID = 'pos-screen-config-form';

const DEFAULT_FORM_VALUES: ScreenConfigFormData = {
  kitchenIsActive: false,
  kitchenShowType: 'all',
  kitchenType: 'manual',
  kitchenValue: '',
  kitchenIsPrint: false,
  waitingIsActive: false,
  waitingType: 'time',
  waitingValue: '',
  waitingContentUrl: '',
  waitingIsPrint: false,
};

const ScreenConfig: React.FC<ScreenConfigProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<ScreenConfigFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  useEffect(() => {
    if (!posDetail) {
      return;
    }

    const kitchenScreen = posDetail.kitchenScreen || {};
    const waitingScreen = posDetail.waitingScreen || {};

    reset({
      kitchenIsActive: kitchenScreen.isActive ?? false,
      kitchenShowType: kitchenScreen.showType || 'all',
      kitchenType: kitchenScreen.type || 'manual',
      kitchenValue: kitchenScreen.value || '',
      kitchenIsPrint: kitchenScreen.isPrint ?? false,
      waitingIsActive: waitingScreen.isActive ?? false,
      waitingType: waitingScreen.type || 'time',
      waitingValue: waitingScreen.value || '',
      waitingContentUrl: waitingScreen.contentUrl || '',
      waitingIsPrint: waitingScreen.isPrint ?? false,
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: ScreenConfigFormData) => {
      if (!posId) {
        toast({
          title: 'Error',
          description: 'POS ID is required',
          variant: 'destructive',
        });
        return;
      }

      try {
        await posEdit({
          variables: {
            _id: posId,
            kitchenScreen: {
              isActive: data.kitchenIsActive,
              showType: data.kitchenShowType,
              type: data.kitchenType,
              value: data.kitchenValue,
              isPrint: data.kitchenIsPrint,
            },
            waitingScreen: {
              isActive: data.waitingIsActive,
              type: data.waitingType,
              value: data.waitingValue,
              contentUrl: data.waitingContentUrl,
              isPrint: data.waitingIsPrint,
            },
          },
        });

        toast({
          title: 'Success',
          description: 'Screen config saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save screen config',
          variant: 'destructive',
        });
      }
    },
    [posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={SCREEN_CONFIG_FORM_ID}
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
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 rounded-lg animate-pulse bg-muted" />
            <div className="h-48 rounded-lg animate-pulse bg-muted" />
          </div>
          <div className="h-24 rounded-lg animate-pulse bg-muted" />
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
          id={SCREEN_CONFIG_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          <section className="space-y-4">
            <Label>Kitchen screen</Label>

            <KitchenScreen control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Waiting screen</Label>

            <WaitingScreen control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Print</Label>

            <PrintConfig control={control} />
          </section>
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title="Screen configuration">
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default ScreenConfig;
