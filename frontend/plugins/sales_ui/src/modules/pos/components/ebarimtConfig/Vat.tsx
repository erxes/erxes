import { useState, useEffect } from 'react';
import { Label, Input, Button, Checkbox, Select, toast } from 'erxes-ui';
import { useMutation, useQuery } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';
import queries from '../../graphql/queries';

interface VatProps {
  posId?: string;
}

export const Vat: React.FC<VatProps> = ({ posId }) => {
  const [hasVat, setHasVat] = useState(false);
  const [vatPercent, setVatPercent] = useState('0');
  const [reverseVatRules, setReverseVatRules] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  const { data: vatRulesData, loading: vatRulesLoading } = useQuery(
    queries.ebarimtProductRules,
    {
      variables: { kind: 'vat' },
    },
  );

  const vatRulesOptions =
    vatRulesData?.ebarimtProductRules?.list?.length > 0
      ? vatRulesData.ebarimtProductRules.list
      : [];

  useEffect(() => {
    if (posDetail?.ebarimtConfig) {
      setHasVat(posDetail.ebarimtConfig.hasVat ?? false);
      setVatPercent(String(posDetail.ebarimtConfig.vatPercent ?? 0));
      setReverseVatRules(posDetail.ebarimtConfig.reverseVatRules || []);
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
            hasVat,
            vatPercent: Number(vatPercent),
            reverseVatRules,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'VAT config saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save VAT config',
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
          <Label>HAS VAT</Label>
          <Checkbox
            checked={hasVat}
            onCheckedChange={(checked) => {
              setHasVat(checked === true);
              setHasChanges(true);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>VAT PERCENT</Label>
          <Input
            type="number"
            value={vatPercent}
            onChange={(e) => {
              setVatPercent(e.target.value);
              setHasChanges(true);
            }}
            placeholder="0"
          />
        </div>

        {hasVat && (
          <div className="space-y-2">
            <Label>ANOTHER RULES OF PRODUCTS ON VAT</Label>
            <Select
              value={reverseVatRules[0] || ''}
              onValueChange={(val) => {
                setReverseVatRules([val]);
                setHasChanges(true);
              }}
            >
              <Select.Trigger className="w-48">
                <Select.Value placeholder="Select rule" />
              </Select.Trigger>
              <Select.Content>
                {vatRulesLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  vatRulesOptions.map(
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
