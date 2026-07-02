import { useMutation } from '@apollo/client';
import { IconArrowMerge, IconCheck } from '@tabler/icons-react';
import { Button, cn, Input, ScrollArea, Sheet, Spinner, toast } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, IProduct } from 'ui-modules';
import { productsMutations, productsQueries } from '../../graphql';

type MergeField = {
  key: string;
  label: string;
  required?: boolean;
  getValue: (product: any) => any;
  getDisplay: (product: any) => string;
};

const MERGE_FIELDS: MergeField[] = [
  {
    key: 'name',
    label: 'Name',
    required: true,
    getValue: (p) => p.name,
    getDisplay: (p) => p.name ?? '',
  },
  {
    key: 'code',
    label: 'Code',
    required: true,
    getValue: (p) => p.code,
    getDisplay: (p) => p.code ?? '',
  },
  {
    key: 'type',
    label: 'Type',
    required: true,
    getValue: (p) => p.type,
    getDisplay: (p) => p.type ?? '',
  },
  {
    key: 'unitPrice',
    label: 'Unit price',
    required: true,
    getValue: (p) => p.unitPrice,
    getDisplay: (p) => (p.unitPrice ?? 0).toLocaleString(),
  },
  {
    key: 'categoryId',
    label: 'Category',
    required: true,
    getValue: (p) => p.categoryId,
    getDisplay: (p) => p.category?.name ?? p.categoryId ?? '',
  },
  {
    key: 'shortName',
    label: 'Short name',
    getValue: (p) => p.shortName,
    getDisplay: (p) => p.shortName ?? '',
  },
  {
    key: 'uom',
    label: 'UOM',
    getValue: (p) => p.uom,
    getDisplay: (p) => p.uom ?? '',
  },
  {
    key: 'description',
    label: 'Description',
    getValue: (p) => p.description,
    getDisplay: (p) => toPlainText(p.description),
  },
];

const hasValue = (value: any) =>
  value !== null && value !== undefined && value !== '';

// description is stored as rich-text (blocknote) JSON; show readable plain text
const toPlainText = (raw: any): string => {
  if (!raw || typeof raw !== 'string') return raw ?? '';
  try {
    const blocks = JSON.parse(raw);
    if (Array.isArray(blocks)) {
      const text = blocks
        .map((block: any) =>
          Array.isArray(block?.content)
            ? block.content.map((c: any) => c?.text ?? '').join('')
            : '',
        )
        .join(' ')
        .trim();
      return text || raw;
    }
  } catch {
    // not JSON, use as-is
  }
  return raw;
};

const propertiesEntries = (product: any): [string, any][] =>
  Object.entries(product?.propertiesData || {}).filter(([, v]) => hasValue(v));

const propertyDisplay = (value: any) =>
  typeof value === 'object' ? JSON.stringify(value) : String(value);

export const ProductMerge = ({
  productIds,
  products,
}: {
  productIds: string[];
  products: IProduct[];
}) => {
  const { t } = useTranslation('product');
  const [open, setOpen] = useState(false);
  const canMerge = products.length === 2;

  return (
    <Can action="productsMerge">
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button variant="secondary" disabled={!canMerge}>
            <IconArrowMerge />
            {t('merge', 'Merge')}
          </Button>
        </Sheet.Trigger>
        <Sheet.View className="flex flex-col gap-0 p-0 sm:max-w-4xl">
          <Sheet.Header className="flex-row items-center gap-3 space-y-0 border-b p-3">
            <Sheet.Title>{t('merge-products', 'Merge products')}</Sheet.Title>
            <Sheet.Close />
            <Sheet.Description className="sr-only">
              {t('merge-products', 'Merge products')}
            </Sheet.Description>
          </Sheet.Header>
          {canMerge && (
            <ProductMergeBody
              productIds={productIds}
              products={products}
              setOpen={setOpen}
            />
          )}
        </Sheet.View>
      </Sheet>
    </Can>
  );
};

const SourceCell = ({
  display,
  selectable,
  selected,
  onSelect,
}: {
  display?: string;
  selectable: boolean;
  selected: boolean;
  onSelect: () => void;
}) => {
  if (!hasValue(display)) {
    return (
      <div className="min-w-0 px-2 py-1.5 text-sm text-muted-foreground/40">
        —
      </div>
    );
  }

  if (!selectable) {
    return (
      <div className="min-w-0 truncate px-2 py-1.5 text-sm text-muted-foreground">
        {display}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors',
        selected
          ? 'border-primary bg-primary/5 font-medium text-primary'
          : 'border-border hover:border-primary/40 hover:bg-accent',
      )}
    >
      <span
        className={cn(
          'flex size-3.5 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-primary bg-primary text-white'
            : 'border-muted-foreground/40 bg-background',
        )}
      >
        {selected && <IconCheck className="size-2.5" />}
      </span>
      <span className="truncate">{display}</span>
    </button>
  );
};

const ResultCell = ({ display }: { display?: string }) => (
  <div className="min-w-0 self-stretch border-l pl-4">
    <div
      className={cn(
        'truncate px-2 py-1.5 text-sm font-semibold',
        !hasValue(display) && 'font-normal text-muted-foreground/40',
      )}
    >
      {hasValue(display) ? display : '—'}
    </div>
  </div>
);

const ProductMergeBody = ({
  productIds,
  products,
  setOpen,
}: {
  productIds: string[];
  products: IProduct[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('product');
  const [productA, productB] = products;

  const initValues = useMemo(() => {
    const values: Record<string, any> = {};
    for (const field of MERGE_FIELDS) {
      const a = field.getValue(productA);
      const b = field.getValue(productB);
      values[field.key] = hasValue(a) ? a : b;
    }
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productA?._id, productB?._id]);

  const [value, setValue] = useState<Record<string, any>>(initValues);
  useEffect(() => setValue(initValues), [initValues]);

  const mergedProperties = useMemo(() => {
    const aProperties = (productA as any)?.propertiesData || {};
    return [
      ...propertiesEntries(productA),
      ...propertiesEntries(productB).filter(([key]) => !(key in aProperties)),
    ];
  }, [productA, productB]);

  const [mergeProducts, { loading }] = useMutation(
    productsMutations.productsMerge,
    { refetchQueries: [productsQueries.productsMain] },
  );

  const handleSave = () => {
    const missing = MERGE_FIELDS.filter(
      (f) => f.required && !hasValue(value[f.key]),
    );
    if (missing.length) {
      toast({
        title: t('error', 'Error'),
        description: `${t('required', 'Required')}: ${missing
          .map((f) => f.label)
          .join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    mergeProducts({
      variables: { productIds, productFields: value },
      onCompleted: () => {
        toast({ title: t('success', 'Success'), variant: 'success' });
        setOpen(false);
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  const resolvedDisplay = (field: MergeField) => {
    const current = value[field.key];
    if (!hasValue(current)) return '';
    const match = products.find((p) => field.getValue(p) === current);
    return match ? field.getDisplay(match) : String(current);
  };

  const grid = 'grid grid-cols-[minmax(90px,130px)_1fr_1fr_1fr] gap-x-3';

  return (
    <>
      <Sheet.Content className="min-h-0 flex-auto overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="overflow-hidden rounded-xl border">
              <div
                className={cn(
                  grid,
                  'items-center border-b bg-muted/30 px-4 py-3',
                )}
              >
                <span />
                <span className="min-w-0 truncate px-2 text-sm font-semibold">
                  {(productA as any)?.name}
                </span>
                <span className="min-w-0 truncate px-2 text-sm font-semibold">
                  {(productB as any)?.name}
                </span>
                <span className="flex min-w-0 items-center gap-1.5 truncate self-stretch border-l py-0.5 pl-6 text-sm font-semibold text-primary">
                  <IconArrowMerge className="size-4 shrink-0" />
                  {t('new-product', 'New product')}
                </span>
              </div>

              <div className="divide-y">
                {MERGE_FIELDS.map((field) => {
                  const a = field.getValue(productA);
                  const b = field.getValue(productB);
                  const bothEmpty = !hasValue(a) && !hasValue(b);
                  if (bothEmpty && !field.required) return null;

                  const differ = hasValue(a) && hasValue(b) && a !== b;
                  const isNumber = field.key === 'unitPrice';

                  return (
                    <div
                      key={field.key}
                      className={cn(grid, 'items-center px-4 py-2')}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {field.label}
                        {field.required && (
                          <span className="ml-0.5 text-destructive">*</span>
                        )}
                      </span>
                      <SourceCell
                        display={
                          hasValue(a) ? field.getDisplay(productA) : undefined
                        }
                        selectable={differ}
                        selected={differ && value[field.key] === a}
                        onSelect={() =>
                          setValue((prev) => ({ ...prev, [field.key]: a }))
                        }
                      />
                      <SourceCell
                        display={
                          hasValue(b) ? field.getDisplay(productB) : undefined
                        }
                        selectable={differ}
                        selected={differ && value[field.key] === b}
                        onSelect={() =>
                          setValue((prev) => ({ ...prev, [field.key]: b }))
                        }
                      />
                      {bothEmpty ? (
                        <div className="self-stretch border-l pl-4">
                          <Input
                            className="h-8"
                            type={isNumber ? 'number' : 'text'}
                            placeholder={t('enter-value', 'Enter value')}
                            value={value[field.key] ?? ''}
                            onChange={(e) =>
                              setValue((prev) => ({
                                ...prev,
                                [field.key]: isNumber
                                  ? e.target.value === ''
                                    ? ''
                                    : Number(e.target.value)
                                  : e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <ResultCell display={resolvedDisplay(field)} />
                      )}
                    </div>
                  );
                })}

                {mergedProperties.length > 0 && (
                  <div className={cn(grid, 'items-start px-4 py-2')}>
                    <span className="pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('properties', 'Properties')}
                    </span>
                    {[productA, productB].map((product, index) => {
                      const entries = propertiesEntries(product);
                      return (
                        <div
                          key={index}
                          className="flex min-w-0 flex-col gap-0.5 px-2 py-1.5 text-sm text-muted-foreground"
                        >
                          {entries.length
                            ? entries.map(([key, v]) => (
                                <span key={key} className="truncate">
                                  {key}: {propertyDisplay(v)}
                                </span>
                              ))
                            : '—'}
                        </div>
                      );
                    })}
                    <div className="min-w-0 self-stretch border-l pl-4">
                      <div className="flex min-w-0 flex-col gap-0.5 px-2 py-1.5 text-sm font-semibold">
                        {mergedProperties.map(([key, v]) => (
                          <span key={key} className="truncate">
                            {key}: {propertyDisplay(v)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </Sheet.Content>
      <Sheet.Footer className="flex justify-end border-t p-5">
        <Sheet.Close asChild>
          <Button variant="secondary" type="button">
            {t('discard', 'Discard')}
          </Button>
        </Sheet.Close>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Spinner />}
          {t('save', 'Save')}
        </Button>
      </Sheet.Footer>
    </>
  );
};
