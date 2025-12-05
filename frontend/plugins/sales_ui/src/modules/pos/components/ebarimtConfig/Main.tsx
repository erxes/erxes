import { useState, useEffect } from 'react';
import { Label, Input, Button, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';

interface MainProps {
  posId?: string;
}

export const Main: React.FC<MainProps> = ({ posId }) => {
  const [companyName, setCompanyName] = useState('');
  const [ebarimtUrl, setEbarimtUrl] = useState('');
  const [checkTaxpayerUrl, setCheckTaxpayerUrl] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.ebarimtConfig) {
      setCompanyName(posDetail.ebarimtConfig.companyName || '');
      setEbarimtUrl(posDetail.ebarimtConfig.ebarimtUrl || '');
      setCheckTaxpayerUrl(posDetail.ebarimtConfig.checkTaxpayerUrl || '');
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
      const currentConfig = posDetail?.ebarimtConfig || {};
      await posEdit({
        variables: {
          _id: posId,
          ebarimtConfig: {
            ...currentConfig,
            companyName,
            ebarimtUrl,
            checkTaxpayerUrl,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Ebarimt config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save ebarimt config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-24 h-4 rounded animate-pulse bg-muted" />
            <div className="h-10 rounded animate-pulse bg-muted" />
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
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>COMPANY NAME</Label>
          <Input
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter company name"
          />
        </div>

        <div className="space-y-2">
          <Label>EBARIMT URL</Label>
          <Input
            value={ebarimtUrl}
            onChange={(e) => {
              setEbarimtUrl(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter ebarimt URL"
          />
        </div>

        <div className="space-y-2">
          <Label>CHECK TAXPAYER URL</Label>
          <Input
            value={checkTaxpayerUrl}
            onChange={(e) => {
              setCheckTaxpayerUrl(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter check taxpayer URL"
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
