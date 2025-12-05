import { useState, useEffect } from 'react';
import { Label, Switch, Button, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';

interface RemainderProps {
  posId?: string;
}

export const Remainder: React.FC<RemainderProps> = ({ posId }) => {
  const [checkErkhet, setCheckErkhet] = useState(false);
  const [checkInventories, setCheckInventories] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail) {
      setCheckErkhet(posDetail.erkhetConfig?.checkErkhet ?? false);
      setCheckInventories(posDetail.erkhetConfig?.checkInventories ?? false);
    }
  }, [posDetail]);

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
      const currentErkhetConfig = posDetail?.erkhetConfig || {};
      await posEdit({
        variables: {
          _id: posId,
          erkhetConfig: {
            ...currentErkhetConfig,
            checkErkhet,
            checkInventories,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Remainder config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save remainder config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <div className="w-24 h-4 rounded animate-pulse bg-muted" />
          <div className="w-12 h-6 rounded animate-pulse bg-muted" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-32 h-4 rounded animate-pulse bg-muted" />
          <div className="w-12 h-6 rounded animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <Label>CHECK ERKHET</Label>
          <Switch
            checked={checkErkhet}
            onCheckedChange={(checked) => {
              setCheckErkhet(checked);
              setHasChanges(true);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>CHECK INVENTORIES</Label>
          <Switch
            checked={checkInventories}
            onCheckedChange={(checked) => {
              setCheckInventories(checked);
              setHasChanges(true);
            }}
          />
        </div>
      </div>

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
