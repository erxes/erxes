import {
  Button,
  Input,
  Label,
  RecordTable,
  Sheet,
  Spinner,
  Textarea,
  Tooltip,
  useToast,
} from 'erxes-ui';
import { IconArrowsSplit, IconArrowRight } from '@tabler/icons-react';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { useEffect, useState } from 'react';

import { IProductData } from 'ui-modules';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useSplitDeal } from '../hooks/useSplitDeal';
import { sumProductsAmount } from '../merge/mergePreview';
import { buildProductNameMap, partitionSplitProducts } from './splitPreview';
import { ConfirmByTyping } from '../ConfirmByTyping';

const formatAmount = (value: number) => `${(value || 0).toLocaleString()}₮`;

/**
 * Command-bar action: split the selected product lines out of this deal into a
 * brand new deal. A merge-style sheet lets the user choose where the new deal
 * lands (Board → Pipeline → Stage), name it, and preview which products move
 * vs. stay before confirming.
 */
export const DealSplitSheet = ({
  productIds,
  refetch,
  dealId,
}: {
  productIds: string[];
  refetch: () => void;
  dealId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [boardId, setBoardId] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();

  const { deal, loading: dealLoading } = useDealDetail({
    variables: { _id: dealId },
    skip: !open,
  });

  const { splitDeal, loading } = useSplitDeal({
    onCompleted: () => {
      refetch();
      table.resetRowSelection();
      setOpen(false);
    },
  });

  useEffect(() => {
    if (open) {
      setName(deal?.name ? `${deal.name} (split)` : '');
      setDescription('');
      setBoardId('');
      setPipelineId('');
      setStageId('');
    }
  }, [open, deal?.name]);

  const { moving, staying } = partitionSplitProducts(
    deal?.productsData,
    productIds,
  );
  const productNames = buildProductNameMap(deal);
  const count = productIds.length;

  // A split must leave at least one product behind, so it's blocked when the
  // deal has only one product or when every product is selected.
  const totalProducts = table.getCoreRowModel().rows.length;
  const splitDisabledReason =
    totalProducts <= 1
      ? 'A deal needs at least 2 products to split.'
      : count >= totalProducts
        ? 'At least one product must stay on this deal — deselect some.'
        : count === 0
          ? 'Select at least one product to split.'
          : null;

  const handleSplit = () => {
    if (splitDisabledReason) {
      toast({
        title: 'Cannot split',
        description: splitDisabledReason,
        variant: 'destructive',
      });
      return;
    }
    splitDeal({
      variables: {
        dealId,
        splits: [
          {
            name: name.trim() || undefined,
            productIds,
            stageId: stageId || undefined,
            description: description.trim() || undefined,
          },
        ],
      },
    });
  };

  const handleBoardChange = (val: string | string[]) => {
    setBoardId(Array.isArray(val) ? val[0] : val);
    setPipelineId('');
    setStageId('');
  };
  const handlePipelineChange = (val: string | string[]) => {
    setPipelineId(Array.isArray(val) ? val[0] : val);
    setStageId('');
  };
  const handleStageChange = (val: string | string[]) => {
    setStageId(Array.isArray(val) ? val[0] : val);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {splitDisabledReason ? (
        <Tooltip>
          <Tooltip.Trigger asChild>
            {/* Wrapper keeps the tooltip working on a disabled button. */}
            <span className="inline-block">
              <Button variant="secondary" disabled>
                <IconArrowsSplit />
                Split
              </Button>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>{splitDisabledReason}</Tooltip.Content>
        </Tooltip>
      ) : (
        <Sheet.Trigger asChild>
          <Button variant="secondary">
            <IconArrowsSplit />
            Split
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="sm:max-w-xl flex flex-col gap-0 m-0 p-0">
        <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
          <Sheet.Title className="flex items-center gap-2">
            <IconArrowsSplit className="size-4" />
            Split into a new deal
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-0 min-h-0 overflow-hidden">
          {dealLoading && !deal ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
              <p className="text-sm text-muted-foreground">
                The {count} selected product{count === 1 ? '' : 's'} will be
                moved into a new deal and removed from this one.
              </p>

              <div className="flex flex-col gap-1">
                <Label htmlFor="split-name">New deal name</Label>
                <Input
                  id="split-name"
                  placeholder="Optional — defaults to “… (split)”"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <Section title="Destination">
                <div className="flex flex-col gap-2">
                  <Field label="Board">
                    <SelectBoard
                      value={boardId}
                      onValueChange={handleBoardChange}
                    />
                  </Field>
                  <Field label="Pipeline">
                    <SelectPipeline
                      value={pipelineId}
                      boardId={boardId}
                      onValueChange={handlePipelineChange}
                      disabled={!boardId}
                    />
                  </Field>
                  <Field label="Stage">
                    <SelectStage
                      value={stageId}
                      pipelineId={pipelineId}
                      onValueChange={handleStageChange}
                      disabled={!pipelineId}
                    />
                  </Field>
                  {!stageId && (
                    <p className="text-xs text-muted-foreground">
                      Leave empty to keep the new deal in this deal’s current
                      stage.
                    </p>
                  )}
                </div>
              </Section>

              <div className="flex flex-col gap-1">
                <Label htmlFor="split-description">Description</Label>
                <Textarea
                  id="split-description"
                  placeholder="Optional — defaults to this deal’s description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Section title="Products">
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                  <ProductBucket
                    title="Moving to new deal"
                    highlight
                    lines={moving}
                    productNames={productNames}
                  />
                  <IconArrowRight className="mt-8 size-4 text-muted-foreground" />
                  <ProductBucket
                    title="Staying on this deal"
                    lines={staying}
                    productNames={productNames}
                  />
                </div>
              </Section>
            </div>
          )}
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end p-5 border-t">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <ConfirmByTyping
            keyword="split"
            title="Confirm split"
            description={`This moves the ${count} selected product${
              count === 1 ? '' : 's'
            } into a new deal and removes ${
              count === 1 ? 'it' : 'them'
            } from this one.`}
            confirmLabel="Split deal"
            loading={loading}
            onConfirm={handleSplit}
          >
            <Button disabled={loading || !!splitDisabledReason}>
              <IconArrowsSplit />
              {loading ? 'Splitting…' : 'Split'}
            </Button>
          </ConfirmByTyping>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs font-semibold uppercase text-muted-foreground">
      {title}
    </span>
    {children}
  </div>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-accent-foreground">{label}</span>
    {children}
  </div>
);

const ProductBucket = ({
  title,
  lines,
  productNames,
  highlight,
}: {
  title: string;
  lines: IProductData[];
  productNames: Map<string, string>;
  highlight?: boolean;
}) => (
  <div
    className={[
      'flex flex-col gap-1.5 rounded-md border p-3',
      highlight ? 'border-primary bg-primary/5' : 'bg-muted/30',
    ].join(' ')}
  >
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium text-muted-foreground">{title}</span>
      <span className="text-muted-foreground">({lines.length})</span>
    </div>
    {lines.length === 0 ? (
      <span className="text-sm text-muted-foreground">None</span>
    ) : (
      lines.map((pd, index) => {
        const id = pd.productId || pd.product?._id || '';
        return (
          <div
            key={pd._id || `${id}-${index}`}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="truncate">
              {productNames.get(id) || pd.product?.name || 'Product'}
              <span className="text-muted-foreground">
                {' '}
                × {pd.quantity || 0}
              </span>
            </span>
            <span className="font-medium tabular-nums">
              {formatAmount(pd.amount)}
            </span>
          </div>
        );
      })
    )}
    <div className="mt-1 flex items-center justify-between border-t pt-1 text-sm font-semibold">
      <span>Total</span>
      <span className="tabular-nums text-primary">
        {formatAmount(sumProductsAmount(lines))}
      </span>
    </div>
  </div>
);
