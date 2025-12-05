import { useState, useEffect } from 'react';
import { Button, Label, toast, ColorPicker } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';

interface MainColorsProps {
  posId?: string;
}

export const MainColors: React.FC<MainColorsProps> = ({ posId }) => {
  const [bodyColor, setBodyColor] = useState<string>('#FFFFFF');
  const [headerColor, setHeaderColor] = useState<string>('#6569DF');
  const [footerColor, setFooterColor] = useState<string>('#3CCC38');

  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.uiOptions?.colors) {
      setBodyColor(posDetail.uiOptions.colors.bodyColor || '#FFFFFF');
      setHeaderColor(posDetail.uiOptions.colors.headerColor || '#6569DF');
      setFooterColor(posDetail.uiOptions.colors.footerColor || '#3CCC38');
    }
  }, [posDetail]);

  const handleColorChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);
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
      const currentUiOptions = posDetail?.uiOptions || {};
      await posEdit({
        variables: {
          _id: posId,
          uiOptions: {
            ...currentUiOptions,
            colors: {
              bodyColor,
              headerColor,
              footerColor,
            },
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Main colors saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save main colors',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-20 h-4 rounded animate-pulse bg-muted" />
            <div className="w-full h-10 rounded-md animate-pulse bg-muted" />
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
      <div className="flex gap-6">
        <div className="space-y-2">
          <Label>PRIMARY</Label>
          <ColorPicker
            className="w-20 h-8"
            value={bodyColor}
            onValueChange={(value: string) =>
              handleColorChange(setBodyColor, value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>SECONDARY</Label>
          <ColorPicker
            className="w-20 h-8"
            value={headerColor}
            onValueChange={(value: string) =>
              handleColorChange(setHeaderColor, value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>THIRD</Label>
          <ColorPicker
            className="w-20 h-8"
            value={footerColor}
            onValueChange={(value: string) =>
              handleColorChange(setFooterColor, value)
            }
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
