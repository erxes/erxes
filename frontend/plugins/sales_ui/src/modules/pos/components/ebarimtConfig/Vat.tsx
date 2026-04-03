import { useState, useEffect } from 'react';
import { Label, Input, Button, Checkbox, Select, toast } from 'erxes-ui';
import { useMutation, useQuery } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import queries from '@/pos/graphql/queries';
import { cleanData } from '@/pos/utils/cleanData';

interface VatProps {
  posId?: string;
}

export const Vat: React.FC<VatProps> = ({ posId }) => {
  const [hasVat, setHasVat] = useState(false);
  const [vatPercent, setVatPercent] = useState('0');
  const [reverseVatRules, setReverseVatRules] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
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

  const handleToggleRule = (val: string) => {
    setReverseVatRules((prev) =>
      prev.includes(val) ? prev.filter((rule) => rule !== val) : [...prev, val],
    );
    setHasChanges(true);
  };

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

    const vatPercentNumber = Number(vatPercent);
    if (isNaN(vatPercentNumber) || vatPercentNumber < 0) {
      toast({
        title: 'Error',
        description: 'VAT percent must be a valid non-negative number',
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
            hasVat,
            vatPercent: vatPercentNumber,
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
              // allow selecting multiple rules by toggling them into the array
              value=""
              onValueChange={handleToggleRule}
            >
              <Select.Trigger className="w-48">
                <Select.Value
                  placeholder={
                    reverseVatRules.length
                      ? `${reverseVatRules.length} selected`
                      : 'Select rule(s)'
                  }
                />
              </Select.Trigger>
              <Select.Content>
                {vatRulesLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  vatRulesOptions.map(
                    (rule: { _id: string; title: string }) => (
                      <Select.Item
                        key={rule._id}
                        value={rule._id}
                        className={
                          reverseVatRules.includes(rule._id)
                            ? 'bg-muted font-medium'
                            : undefined
                        }
                      >
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
