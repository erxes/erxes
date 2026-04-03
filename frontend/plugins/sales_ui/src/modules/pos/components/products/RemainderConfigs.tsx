import { useState, useEffect } from 'react';
import { Button, Label, toast, Checkbox } from 'erxes-ui';
import { SelectCategory } from '@/pos/hooks/SelectCategory';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';

interface RemainderConfigsProps {
  posId?: string;
}

export const RemainderConfigs: React.FC<RemainderConfigsProps> = ({
  posId,
}) => {
  const [isCheckRemainder, setIsCheckRemainder] = useState<boolean>(false);
  const [checkExcludeCategoryIds, setCheckExcludeCategoryIds] = useState<
    string[]
  >([]);
  const [banFractions, setBanFractions] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);

  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail) {
      setIsCheckRemainder(posDetail.isCheckRemainder || false);
      setCheckExcludeCategoryIds(posDetail.checkExcludeCategoryIds || []);
      setBanFractions(posDetail.banFractions || false);
    }
  }, [posDetail]);

  const handleCheckRemainderChange = (checked: boolean) => {
    setIsCheckRemainder(checked);
    setHasChanges(true);
  };

  const handleCategorySelect = (value: string | string[]) => {
    setCheckExcludeCategoryIds(
      Array.isArray(value) ? value : value ? [value] : [],
    );
    setHasChanges(true);
  };

  const handleBanFractionsChange = (checked: boolean) => {
    setBanFractions(checked);
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
          isCheckRemainder,
          checkExcludeCategoryIds,
          banFractions,
        },
      });

      toast({
        title: 'Success',
        description: 'Remainder configs saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save remainder configs',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="w-6 h-6 rounded animate-pulse bg-background" />
        <div className="h-10 rounded animate-pulse bg-background" />
        <div className="w-32 h-6 rounded animate-pulse bg-background" />
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
      <div className="grid grid-cols-2 gap-4">
        <div className="flex gap-2 items-center">
          <Checkbox
            id="isCheckRemainder"
            checked={isCheckRemainder}
            onCheckedChange={handleCheckRemainderChange}
          />
          <Label htmlFor="isCheckRemainder" className="cursor-pointer">
            Check Remainder
          </Label>
        </div>

        <div className="flex gap-2 items-center">
          <Checkbox
            id="banFractions"
            checked={banFractions}
            onCheckedChange={handleBanFractionsChange}
          />
          <Label htmlFor="banFractions">BAN FRACTIONS</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>EXCLUDE CATEGORIES</Label>
        <SelectCategory
          mode="multiple"
          value={checkExcludeCategoryIds}
          onValueChange={handleCategorySelect}
          placeholder="Select categories to exclude"
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
