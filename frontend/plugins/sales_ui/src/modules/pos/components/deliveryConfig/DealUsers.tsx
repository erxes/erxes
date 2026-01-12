import { useState, useEffect } from 'react';
import { Label, Button, toast, Combobox, PopoverScoped } from 'erxes-ui';
import { SelectMember, SelectProduct } from 'ui-modules';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { cleanData } from '@/pos/utils/cleanData';

interface DealUsersProps {
  posId?: string;
}

export const DealUsers: React.FC<DealUsersProps> = ({ posId }) => {
  const [watchedUserIds, setWatchedUserIds] = useState<string[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [productId, setProductId] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.deliveryConfig) {
      setWatchedUserIds(posDetail.deliveryConfig.watchedUserIds || []);
      setAssignedUserIds(posDetail.deliveryConfig.assignedUserIds || []);
      setProductId(posDetail.deliveryConfig.productId || '');
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
      const currentConfig = cleanData(posDetail?.deliveryConfig || {});
      await posEdit({
        variables: {
          _id: posId,
          deliveryConfig: {
            ...currentConfig,
            watchedUserIds,
            assignedUserIds,
            productId,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Deal users config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save deal users config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-32 h-4 rounded animate-pulse bg-muted" />
            <div className="h-8 rounded animate-pulse bg-muted" />
          </div>
        ))}
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>WATCHED USERS</Label>
        <SelectMember.Provider
          value={watchedUserIds}
          onValueChange={(value) => {
            setWatchedUserIds(value as string[]);
            setHasChanges(true);
          }}
          mode="multiple"
        >
          <PopoverScoped>
            <Combobox.Trigger className="w-full h-8">
              <SelectMember.Value placeholder="Choose team member" />
            </Combobox.Trigger>
            <Combobox.Content>
              <SelectMember.Content />
            </Combobox.Content>
          </PopoverScoped>
        </SelectMember.Provider>
      </div>

      <div className="space-y-2">
        <Label>ASSIGNED USERS</Label>
        <SelectMember.Provider
          value={assignedUserIds}
          onValueChange={(value) => {
            setAssignedUserIds(value as string[]);
            setHasChanges(true);
          }}
          mode="multiple"
        >
          <PopoverScoped>
            <Combobox.Trigger className="w-full h-8">
              <SelectMember.Value placeholder="Choose team member" />
            </Combobox.Trigger>
            <Combobox.Content>
              <SelectMember.Content />
            </Combobox.Content>
          </PopoverScoped>
        </SelectMember.Provider>
      </div>

      <div className="space-y-2">
        <Label>DELIVERY PRODUCT</Label>
        <SelectProduct
          value={productId}
          onValueChange={(value) => {
            const id = Array.isArray(value) ? value[0] : value;
            setProductId(id || '');
            setHasChanges(true);
          }}
          mode="single"
          placeholder="Choose delivery product"
        />
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
