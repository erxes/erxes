import { useState, useEffect } from 'react';
import { Label, Switch, Input, Button, Select, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { cleanData } from '@/pos/utils/cleanData';
import { options } from '@/pos/constants';

interface MainProps {
  posId?: string;
}

export const Main: React.FC<MainProps> = ({ posId }) => {
  const [isSyncErkhet, setIsSyncErkhet] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [beginNumber, setBeginNumber] = useState('');
  const [defaultPay, setDefaultPay] = useState('');
  const [account, setAccount] = useState('');
  const [location, setLocation] = useState('');
  const [getRemainder, setGetRemainder] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.erkhetConfig) {
      setIsSyncErkhet(posDetail.erkhetConfig.isSyncErkhet ?? false);
      setUserEmail(posDetail.erkhetConfig.userEmail || '');
      setBeginNumber(posDetail.erkhetConfig.beginNumber || '');
      setDefaultPay(posDetail.erkhetConfig.defaultPay || '');
      setAccount(posDetail.erkhetConfig.account || '');
      setLocation(posDetail.erkhetConfig.location || '');
      setGetRemainder(posDetail.erkhetConfig.getRemainder ?? false);
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
      const currentConfig = cleanData(posDetail?.erkhetConfig || {});
      await posEdit({
        variables: {
          _id: posId,
          erkhetConfig: {
            ...currentConfig,
            isSyncErkhet,
            userEmail,
            beginNumber,
            defaultPay,
            account,
            location,
            getRemainder,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Finance config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save finance config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="w-24 h-4 rounded animate-pulse bg-muted" />
          <div className="w-12 h-6 rounded animate-pulse bg-muted" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-24 h-4 rounded animate-pulse bg-muted" />
              <div className="h-10 rounded animate-pulse bg-muted" />
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label>IS SYNC ERKHET</Label>
        <Switch
          checked={isSyncErkhet}
          onCheckedChange={(checked) => {
            setIsSyncErkhet(checked);
            setHasChanges(true);
          }}
        />
      </div>

      {isSyncErkhet && (
        <div className="pt-4 space-y-4 border-t">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>USER EMAIL</Label>
              <Input
                value={userEmail}
                onChange={(e) => {
                  setUserEmail(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Enter user email"
              />
            </div>

            <div className="space-y-2">
              <Label>BEGIN BILL NUMBER</Label>
              <Input
                value={beginNumber}
                onChange={(e) => {
                  setBeginNumber(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Enter begin number"
              />
            </div>

            <div className="space-y-2">
              <Label>DEFAULTPAY</Label>
              <Select
                value={defaultPay}
                onValueChange={(val) => {
                  setDefaultPay(val);
                  setHasChanges(true);
                }}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Select default pay" />
                </Select.Trigger>
                <Select.Content>
                  {options.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>ACCOUNT</Label>
              <Input
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Enter account"
              />
            </div>

            <div className="space-y-2">
              <Label>LOCATION</Label>
              <Input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Enter location"
              />
            </div>
          </div>
        </div>
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
