import { useState, useEffect } from 'react';
import { InfoCard, Button, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { KitchenScreen } from '@/pos/components/screenConfig/KitchenScreen';
import { WaitingScreen } from '@/pos/components/screenConfig/WaitingScreen';
import { PrintConfig } from '@/pos/components/screenConfig/PrintConfig';
import { isFieldVisible } from '@/pos/constants';

interface ScreenConfigProps {
  posId?: string;
  posType?: string;
}

interface KitchenScreenData {
  isActive?: boolean;
  isPrint?: boolean;
  type?: string;
  showType?: string;
  value?: string;
}

interface WaitingScreenData {
  isActive?: boolean;
  isPrint?: boolean;
  type?: string;
  contentUrl?: string;
  value?: string;
}

const ScreenConfig: React.FC<ScreenConfigProps> = ({ posId, posType }) => {
  const [kitchenScreen, setKitchenScreen] = useState<KitchenScreenData>({});
  const [waitingScreen, setWaitingScreen] = useState<WaitingScreenData>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: `Failed to load screen config: ${error.message}`,
        variant: 'destructive',
      });
      return;
    }

    if (posDetail && !error) {
      setKitchenScreen(posDetail.kitchenScreen || {});
      setWaitingScreen(posDetail.waitingScreen || {});
    }
  }, [posDetail, error]);

  const handleKitchenChange = (data: KitchenScreenData) => {
    setKitchenScreen(data);
    setHasChanges(true);
  };

  const handleWaitingChange = (data: WaitingScreenData) => {
    setWaitingScreen(data);
    setHasChanges(true);
  };

  const handlePrintChange = (data: {
    kitchenIsPrint: boolean;
    waitingIsPrint: boolean;
  }) => {
    setKitchenScreen((prev) => ({ ...prev, isPrint: data.kitchenIsPrint }));
    setWaitingScreen((prev) => ({ ...prev, isPrint: data.waitingIsPrint }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
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
          kitchenScreen,
          waitingScreen,
        },
      });

      toast({
        title: 'Success',
        description: 'Screen config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save screen config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="p-6 space-y-6">
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
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {isFieldVisible('kitchenScreen', posType) && (
          <InfoCard title="Kitchen screen">
            <InfoCard.Content>
              <KitchenScreen
                data={kitchenScreen}
                onChange={handleKitchenChange}
              />
            </InfoCard.Content>
          </InfoCard>
        )}

        {isFieldVisible('waitingScreen', posType) && (
          <InfoCard title="Waiting screen">
            <InfoCard.Content>
              <WaitingScreen
                data={waitingScreen}
                onChange={handleWaitingChange}
              />
            </InfoCard.Content>
          </InfoCard>
        )}
      </div>

      {isFieldVisible('printScreen', posType) && (
        <InfoCard title="Print">
          <InfoCard.Content>
            <PrintConfig
              kitchenIsPrint={kitchenScreen.isPrint}
              waitingIsPrint={waitingScreen.isPrint}
              onChange={handlePrintChange}
            />
          </InfoCard.Content>
        </InfoCard>
      )}

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScreenConfig;
