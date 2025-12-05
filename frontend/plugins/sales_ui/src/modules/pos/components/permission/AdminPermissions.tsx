import { useEffect, useState } from 'react';
import { Button, Label, Input, Switch, toast } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';

interface AdminPermissionsProps {
  posId?: string;
}

export const AdminPermissions: React.FC<AdminPermissionsProps> = ({
  posId,
}) => {
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [isPrintTempBill, setIsPrintTempBill] = useState(false);
  const [directDiscount, setDirectDiscount] = useState(false);
  const [directDiscountLimit, setDirectDiscountLimit] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail) {
      setAdminIds(posDetail.adminIds || []);
      const adminConfig = posDetail.permissionConfig?.admins;
      setIsPrintTempBill(adminConfig?.isTempBill ?? false);
      setDirectDiscount(adminConfig?.directDiscount ?? false);
      setDirectDiscountLimit(
        adminConfig?.directDiscountLimit?.toString() || '',
      );
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
      const currentPermissionConfig = posDetail?.permissionConfig || {};
      await posEdit({
        variables: {
          _id: posId,
          adminIds,
          permissionConfig: {
            ...currentPermissionConfig,
            admins: {
              isTempBill: isPrintTempBill,
              directDiscount: directDiscount,
              directDiscountLimit: directDiscountLimit
                ? Number(directDiscountLimit)
                : 0,
            },
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Admin permissions saved successfully',
      });
      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save admin permissions',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 rounded animate-pulse bg-muted" />
        <div className="h-10 rounded animate-pulse bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>
          POS ADMIN <span className="text-destructive">*</span>
        </Label>
        <SelectMember
          value={adminIds}
          onValueChange={(value) => {
            const ids = Array.isArray(value) ? value : value ? [value] : [];
            setAdminIds(ids);
            setHasChanges(true);
          }}
          mode="multiple"
        />
      </div>

      <div className="flex gap-8 items-center">
        <div className="flex gap-2 items-center">
          <Label className="text-xs">IS PRINT TEMP BILL</Label>
          <Switch
            checked={isPrintTempBill}
            onCheckedChange={(checked) => {
              setIsPrintTempBill(checked);
              setHasChanges(true);
            }}
          />
        </div>

        <div className="flex gap-2 items-center">
          <Label className="text-xs">DIRECT DISCOUNT</Label>
          <Switch
            checked={directDiscount}
            onCheckedChange={(checked) => {
              setDirectDiscount(checked);
              setHasChanges(true);
            }}
          />
        </div>

        {directDiscount && (
          <div className="flex gap-2 items-center">
            <Label className="text-xs">DIRECT DISCOUNT LIMIT</Label>
            <Input
              type="number"
              value={directDiscountLimit}
              onChange={(e) => {
                setDirectDiscountLimit(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter limit"
              className="w-32 h-8"
            />
          </div>
        )}
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
