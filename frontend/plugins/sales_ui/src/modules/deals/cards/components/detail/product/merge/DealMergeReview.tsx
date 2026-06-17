import { Badge, Input, Label, cn } from 'erxes-ui';
import { IconArrowRight } from '@tabler/icons-react';

import { IDeal, IPaymentsData } from '@/deals/types/deals';
import {
  ARRAY_FIELDS,
  MergeArrayItem,
  MergeSelection,
  SCALAR_FIELDS,
  defaultSelection,
  idSetEqual,
} from './mergeFields';
import {
  mergeProductsData,
  sumProductsAmount,
  unionById,
} from './mergePreview';

const formatAmount = (value: number) => `${(value || 0).toLocaleString()}₮`;

/**
 * Right pane of the merge sheet. For every field where the two deals disagree
 * the user picks a winner (or "Both" for list fields); products are previewed
 * already combined, and payments are shown side by side (the target's payments
 * are kept on merge).
 */
export const DealMergeReview = ({
  target,
  source,
  name,
  onNameChange,
  selections,
  onSelectionChange,
}: {
  target: IDeal;
  source: IDeal;
  name: string;
  onNameChange: (name: string) => void;
  selections: Record<string, MergeSelection>;
  onSelectionChange: (key: string, selection: MergeSelection) => void;
}) => {
  const arrayConflicts = ARRAY_FIELDS.filter(
    (f) => !idSetEqual(f.idsOf(target), f.idsOf(source)),
  );
  const scalarConflicts = SCALAR_FIELDS.filter(
    (f) => f.render(f.valueOf(target)) !== f.render(f.valueOf(source)),
  );
  const hasConflicts = arrayConflicts.length > 0 || scalarConflicts.length > 0;

  const mergedProductsData = mergeProductsData(
    target.productsData,
    source.productsData,
  );

  // The survivor's status follows the "Status" conflict choice (defaults to this
  // deal). Mirror that here so the outcome summary always matches the selection.
  const statusSelection = selections['status'] || defaultSelection();
  const resultStatus =
    (statusSelection === 'source' ? source.status : target.status) || 'active';
  const sourceArchived = source.status === 'archived';

  return (
    <div className="flex flex-col gap-6 p-5">
      <div className="flex flex-col gap-1">
        <Label htmlFor="merge-name">
          Merged deal name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="merge-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Name for the merged deal"
        />
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>Merged deal status:</span>
          <Badge
            variant={resultStatus === 'archived' ? 'warning' : 'success'}
            className="h-4 px-1.5 text-[10px] capitalize"
          >
            {resultStatus}
          </Badge>
          {sourceArchived && (
            <span>— resolve the status conflict below; the merged-in deal is
              archived and will be marked as merged.</span>
          )}
        </div>
      </div>

      <Section title="Field conflicts">
        {hasConflicts ? (
          <div className="flex flex-col gap-3">
            {arrayConflicts.map((field) => (
              <ChoiceRow
                key={field.key}
                label={field.label}
                selection={selections[field.key] || defaultSelection()}
                onSelect={(s) => onSelectionChange(field.key, s)}
                target={<ItemBadges items={field.itemsOf(target)} />}
                source={<ItemBadges items={field.itemsOf(source)} />}
                both={
                  <ItemBadges
                    items={unionById(
                      field.itemsOf(target),
                      field.itemsOf(source),
                    )}
                  />
                }
              />
            ))}
            {scalarConflicts.map((field) => (
              <ChoiceRow
                key={field.key}
                label={field.label}
                selection={selections[field.key] || defaultSelection()}
                onSelect={(s) => onSelectionChange(field.key, s)}
                target={
                  <span className="text-sm">
                    {field.render(field.valueOf(target))}
                  </span>
                }
                source={
                  <span className="text-sm">
                    {field.render(field.valueOf(source))}
                  </span>
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No field conflicts — both deals share the same assignees, tags,
            departments, priority, due date and description.
          </p>
        )}
      </Section>

      <Section title={`Products (${mergedProductsData.length})`}>
        <div className="flex flex-col gap-1">
          {mergedProductsData.length === 0 && (
            <span className="text-sm text-muted-foreground">No products</span>
          )}
          {mergedProductsData.map((pd, index) => {
            const id = pd.productId || pd.product?._id || '';
            const productName =
              [...(target.products || []), ...(source.products || [])].find(
                (p) => p._id === id,
              )?.name ||
              pd.product?.name ||
              'Product';
            return (
              <div
                key={pd._id || `${id}-${index}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate">
                  {productName}
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
          })}
          <div className="mt-1 flex items-center justify-between border-t pt-1 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-primary">
              {formatAmount(sumProductsAmount(mergedProductsData))}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Payments">
        <PaymentsReview target={target} source={source} />
      </Section>
    </div>
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

const ChoiceRow = ({
  label,
  selection,
  onSelect,
  target,
  source,
  both,
}: {
  label: string;
  selection: MergeSelection;
  onSelect: (selection: MergeSelection) => void;
  target: React.ReactNode;
  source: React.ReactNode;
  /** When provided, offers a third "Both" option that combines the two sets. */
  both?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-sm font-medium">{label}</span>
    <div className={cn('grid gap-2', both ? 'grid-cols-3' : 'grid-cols-2')}>
      <ChoiceCard
        active={selection === 'target'}
        onClick={() => onSelect('target')}
        caption="This deal"
      >
        {target}
      </ChoiceCard>
      <ChoiceCard
        active={selection === 'source'}
        onClick={() => onSelect('source')}
        caption="Merged-in deal"
      >
        {source}
      </ChoiceCard>
      {both && (
        <ChoiceCard
          active={selection === 'both'}
          onClick={() => onSelect('both')}
          caption="Both (combine)"
        >
          {both}
        </ChoiceCard>
      )}
    </div>
  </div>
);

const ChoiceCard = ({
  active,
  onClick,
  caption,
  children,
}: {
  active: boolean;
  onClick: () => void;
  caption: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex min-h-14 flex-col items-start gap-1 rounded-md border p-2.5 text-left transition-colors',
      active
        ? 'border-primary bg-primary/5'
        : 'border-input hover:border-primary/40',
    )}
  >
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
      {caption}
    </span>
    {children}
  </button>
);

const ItemBadges = ({ items }: { items: MergeArrayItem[] }) => {
  if (!items.length) {
    return <span className="text-sm text-muted-foreground">None</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge
          key={item._id}
          variant="secondary"
          style={
            item.colorCode ? { backgroundColor: item.colorCode } : undefined
          }
          className={item.colorCode ? 'text-white' : undefined}
        >
          {item.label}
        </Badge>
      ))}
    </div>
  );
};

const PaymentsReview = ({
  target,
  source,
}: {
  target: IDeal;
  source: IDeal;
}) => {
  const targetPayments: IPaymentsData = target.paymentsData || {};
  const sourcePayments: IPaymentsData = source.paymentsData || {};
  const types = Array.from(
    new Set([...Object.keys(targetPayments), ...Object.keys(sourcePayments)]),
  );

  if (types.length === 0) {
    return <span className="text-sm text-muted-foreground">No payments</span>;
  }

  const amount = (p?: { amount?: number; currency?: string }) =>
    p?.amount ? `${p.amount.toLocaleString()} ${p.currency || ''}`.trim() : '—';

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1fr_auto_1.2rem_auto] items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Type</span>
        <span className="justify-self-end">This deal</span>
        <span />
        <span className="justify-self-end">Merged-in</span>
      </div>
      {types.map((type) => (
        <div
          key={type}
          className="grid grid-cols-[1fr_auto_1.2rem_auto] items-center gap-2 text-sm"
        >
          <span className="uppercase text-muted-foreground">{type}</span>
          <span className="justify-self-end font-medium tabular-nums">
            {amount(targetPayments[type])}
          </span>
          <IconArrowRight className="size-3 justify-self-center text-muted-foreground" />
          <span className="justify-self-end tabular-nums text-muted-foreground line-through">
            {amount(sourcePayments[type])}
          </span>
        </div>
      ))}
      <p className="mt-1 text-xs text-muted-foreground">
        The merged deal keeps this deal&apos;s payments. The merged-in
        deal&apos;s payments are shown for reference only.
      </p>
    </div>
  );
};
