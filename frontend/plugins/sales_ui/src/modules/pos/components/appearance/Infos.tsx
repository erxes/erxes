import { useState, useEffect } from 'react';
import { Button, Label, Input, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';

interface InfosProps {
  posId?: string;
}

export const Infos: React.FC<InfosProps> = ({ posId }) => {
  const [website, setWebsite] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.uiOptions?.texts) {
      setWebsite(posDetail.uiOptions.texts.website || '');
      setPhone(posDetail.uiOptions.texts.phone || '');
      setHasChanges(false);
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
      const currentUiOptions = posDetail?.uiOptions || {};
      await posEdit({
        variables: {
          _id: posId,
          uiOptions: {
            ...currentUiOptions,
            texts: {
              website,
              phone,
            },
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Infos saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save infos',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load POS details: {error.message}
        </p>
      </div>
    );
  }

  if (detailLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="w-20 h-4 rounded animate-pulse bg-muted" />
          <div className="h-10 rounded animate-pulse bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="w-20 h-4 rounded animate-pulse bg-muted" />
          <div className="h-10 rounded animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>WEBSITE</Label>
          <Input
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter website URL"
          />
        </div>

        <div className="space-y-2">
          <Label>PHONE</Label>
          <Input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter phone number"
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
