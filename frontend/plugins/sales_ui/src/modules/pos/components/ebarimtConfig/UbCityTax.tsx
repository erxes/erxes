import { useState, useEffect } from 'react';
import { Label, Input, Button, Checkbox, Select, toast } from 'erxes-ui';
import { useMutation, useQuery } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';
import queries from '../../graphql/queries';

interface UbCityTaxProps {
  posId?: string;
}

export const UbCityTax: React.FC<UbCityTaxProps> = ({ posId }) => {
  const [hasCitytax, setHasCitytax] = useState(false);
  const [cityTaxPercent, setCityTaxPercent] = useState('0');
  const [reverseCtaxRules, setReverseCtaxRules] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  const { data: ctaxRulesData, loading: ctaxRulesLoading } = useQuery(
    queries.ebarimtProductRules,
    {
      variables: { kind: 'ctax' },
    },
  );

  const ctaxRulesOptions =
    ctaxRulesData?.ebarimtProductRules?.list?.length > 0
      ? ctaxRulesData.ebarimtProductRules.list
      : [];

  useEffect(() => {
    if (posDetail?.ebarimtConfig) {
      setHasCitytax(posDetail.ebarimtConfig.hasCitytax ?? false);
      setCityTaxPercent(String(posDetail.ebarimtConfig.cityTaxPercent ?? 0));
      setReverseCtaxRules(posDetail.ebarimtConfig.reverseCtaxRules || []);
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
            hasCitytax,
            cityTaxPercent: Number(cityTaxPercent),
            reverseCtaxRules,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'UB City Tax config saved successfully',
      });

      setHasChanges(false);
    } catch (err) {
      console.error('Error saving UB City Tax config:', err);
      toast({
        title: 'Error',
        description: 'Failed to save UB City Tax config',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="flex gap-8 items-end">
        <div className="flex flex-col gap-2 pb-2">
          <div className="w-16 h-4 rounded animate-pulse bg-muted" />
          <div className="w-6 h-6 rounded animate-pulse bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-4 rounded animate-pulse bg-muted" />
          <div className="w-32 h-10 rounded animate-pulse bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="w-48 h-4 rounded animate-pulse bg-muted" />
          <div className="w-48 h-10 rounded animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-8 items-end">
        <div className="flex flex-col gap-2 pb-2">
          <Label>HAS UB CITY TAX</Label>
          <Checkbox
            checked={hasCitytax}
            onCheckedChange={(checked) => {
              setHasCitytax(checked === true);
              setHasChanges(true);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>UB CITY TAX PERCENT</Label>
          <Input
            type="number"
            value={cityTaxPercent}
            onChange={(e) => {
              setCityTaxPercent(e.target.value);
              setHasChanges(true);
            }}
            placeholder="0"
          />
        </div>

        {!hasCitytax && (
          <div className="space-y-2">
            <Label>ANOTHER RULES OF PRODUCTS ON CITYTAX</Label>
            <Select
              value={reverseCtaxRules[0] || ''}
              onValueChange={(val) => {
                setReverseCtaxRules([val]);
                setHasChanges(true);
              }}
            >
              <Select.Trigger className="w-48">
                <Select.Value placeholder="Select rule" />
              </Select.Trigger>
              <Select.Content>
                {ctaxRulesLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  ctaxRulesOptions.map(
                    (rule: { _id: string; title: string }) => (
                      <Select.Item key={rule._id} value={rule._id}>
                        {rule.title}
                      </Select.Item>
                    ),
                  )
                )}
              </Select.Content>
            </Select>
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
