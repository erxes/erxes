import { useState, useEffect } from 'react';
import { Label, Button, Checkbox, Textarea, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { cleanData } from '@/pos/utils/cleanData';

interface UiConfigProps {
  posId?: string;
}

export const UiConfig: React.FC<UiConfigProps> = ({ posId }) => {
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [hasCopy, setHasCopy] = useState(false);
  const [hasSumQty, setHasSumQty] = useState(false);
  const [isCleanTaxPrice, setIsCleanTaxPrice] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.ebarimtConfig) {
      setHeaderText(posDetail.ebarimtConfig.headerText || '');
      setFooterText(posDetail.ebarimtConfig.footerText || '');
      setHasCopy(posDetail.ebarimtConfig.hasCopy ?? false);
      setHasSumQty(posDetail.ebarimtConfig.hasSumQty ?? false);
      setIsCleanTaxPrice(posDetail.ebarimtConfig.isCleanTaxPrice ?? false);
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
      const currentConfig = cleanData(posDetail?.ebarimtConfig || {});
      await posEdit({
        variables: {
          _id: posId,
          ebarimtConfig: {
            ...currentConfig,
            headerText,
            footerText,
            hasCopy,
            hasSumQty,
            isCleanTaxPrice,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'UI Config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save UI config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-end gap-8">
          <div className="flex-1 space-y-2">
            <div className="w-24 h-4 rounded animate-pulse bg-muted" />
            <div className="h-20 rounded animate-pulse bg-muted" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="w-24 h-4 rounded animate-pulse bg-muted" />
            <div className="h-20 rounded animate-pulse bg-muted" />
          </div>
        </div>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded animate-pulse bg-muted" />
            <div className="h-4 rounded w-28 animate-pulse bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded animate-pulse bg-muted" />
            <div className="w-20 h-4 rounded animate-pulse bg-muted" />
          </div>
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
      <div className="space-y-4">
        <div className="flex items-end gap-8">
          <div className="flex-1 space-y-2">
            <Label>HEADER TEXT</Label>
            <Textarea
              value={headerText}
              onChange={(e) => {
                setHeaderText(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Write header text"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label>FOOTER TEXT</Label>
            <Textarea
              value={footerText}
              onChange={(e) => {
                setFooterText(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Write footer text"
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasSumQty}
              onCheckedChange={(checked) => {
                setHasSumQty(checked === true);
                setHasChanges(true);
              }}
            />
            <Label>HAS SUMMARY QTY</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasCopy}
              onCheckedChange={(checked) => {
                setHasCopy(checked === true);
                setHasChanges(true);
              }}
            />
            <Label>HAS COPY</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isCleanTaxPrice}
              onCheckedChange={(checked) => {
                setIsCleanTaxPrice(checked === true);
                setHasChanges(true);
              }}
            />
            <Label>IS CLEAN TAX PRICE</Label>
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
