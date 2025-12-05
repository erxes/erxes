import { useState, useEffect } from 'react';
import { Label, Input, Button, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';

interface OtherProps {
  posId?: string;
}

export const Other: React.FC<OtherProps> = ({ posId }) => {
  const [companyRD, setCompanyRD] = useState('');
  const [merchantTin, setMerchantTin] = useState('');
  const [posNo, setPosNo] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [branchNo, setBranchNo] = useState('');
  const [defaultGSCode, setDefaultGSCode] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.ebarimtConfig) {
      setCompanyRD(posDetail.ebarimtConfig.companyRD || '');
      setMerchantTin(posDetail.ebarimtConfig.merchantTin || '');
      setPosNo(posDetail.ebarimtConfig.posNo || '');
      setDistrictCode(posDetail.ebarimtConfig.districtCode || '');
      setBranchNo(posDetail.ebarimtConfig.branchNo || '');
      setDefaultGSCode(posDetail.ebarimtConfig.defaultGSCode || '');
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
            companyRD,
            merchantTin,
            posNo,
            districtCode,
            branchNo,
            defaultGSCode,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Other config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save other config',
        variant: 'destructive',
      });
    }
  };

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
        <div className="grid grid-cols-3 gap-4">
          {[4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-24 h-4 rounded animate-pulse bg-muted" />
              <div className="h-10 rounded animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>COMPANYRD</Label>
            <Input
              value={companyRD}
              onChange={(e) => {
                setCompanyRD(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter company RD"
            />
          </div>

          <div className="space-y-2">
            <Label>MERCHANTTIN</Label>
            <Input
              value={merchantTin}
              onChange={(e) => {
                setMerchantTin(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter merchant TIN"
            />
          </div>

          <div className="space-y-2">
            <Label>POSNO</Label>
            <Input
              value={posNo}
              onChange={(e) => {
                setPosNo(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter POS number"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>DISTRICTCODE</Label>
            <Input
              value={districtCode}
              onChange={(e) => {
                setDistrictCode(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter district code"
            />
          </div>

          <div className="space-y-2">
            <Label>BRANCHNO</Label>
            <Input
              value={branchNo}
              onChange={(e) => {
                setBranchNo(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter branch number"
            />
          </div>

          <div className="space-y-2">
            <Label>DEFAULTGSCODE</Label>
            <Input
              value={defaultGSCode}
              onChange={(e) => {
                setDefaultGSCode(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter default GS code"
            />
          </div>
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
