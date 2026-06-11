import { Badge, Button, Checkbox, Table, Tooltip, cn } from 'erxes-ui';
import {
  IconAlertTriangle,
  IconStar,
  IconStarFilled,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef } from 'react';
import { IMatrixRow } from '../types';

const EditableCell = ({
  value,
  onCommit,
  placeholder,
  numeric,
  align = 'left',
  className,
  disabled,
  edited,
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  numeric?: boolean;
  align?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  edited?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  const commit = () => {
    const next = (ref.current?.textContent ?? '').trim();
    if (next !== value) onCommit(next);
  };

  return (
    <div
      ref={ref}
      contentEditable={!disabled}
      suppressContentEditableWarning
      role="textbox"
      tabIndex={disabled ? -1 : 0}
      data-placeholder={placeholder}
      onBlur={commit}
      onBeforeInput={(e) => {
        const data = (e.nativeEvent as InputEvent).data;
        if (numeric && data && /[^0-9.\-]/.test(data)) {
          e.preventDefault();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          ref.current?.blur();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          if (ref.current) ref.current.textContent = value;
          ref.current?.blur();
        }
      }}
      className={cn(
        'block px-2 w-full h-8 leading-8 cursor-text outline-none truncate',
        align === 'right' && 'text-right',
        'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground',
        edited && 'text-warning',
        disabled && 'cursor-not-allowed opacity-70',
        className,
      )}
    >
      {value}
    </div>
  );
};

interface GeneratedProductsTableProps {
  matrix: IMatrixRow[];
  fieldIds: string[];
  labelOf: (fieldId: string, value: string) => string;
  fieldName: (fieldId: string) => string;
  starRowKey?: string;
  duplicateCodes?: Set<string>;
  defaultUnitPrice?: number;
  onSetStar: (key: string) => void;
  onSetCode: (key: string, code: string) => void;
  onSetPrice: (key: string, price?: number) => void;
  onToggleExcluded: (key: string, current?: boolean) => void;
  onSetAllExcluded: (isExcluded: boolean) => void;
}

const statusBadge = (row: IMatrixRow) => {
  if (row.isExcluded) return <Badge variant="secondary">skipped</Badge>;
  if (row.productId) return <Badge variant="success">existing</Badge>;
  return <Badge variant="info">new</Badge>;
};

const EmptyPanel = ({
  variant = 'muted',
  children,
}: {
  variant?: 'muted' | 'destructive';
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      'flex gap-2 justify-center items-center px-4 py-8 text-sm rounded-lg border border-dashed',
      variant === 'muted' && 'text-muted-foreground',
      variant === 'destructive' && 'border-destructive/50 text-destructive',
    )}
  >
    {children}
  </div>
);

export const GeneratedProductsTable = ({
  matrix,
  fieldIds,
  labelOf,
  fieldName,
  starRowKey,
  duplicateCodes,
  defaultUnitPrice,
  onSetStar,
  onSetCode,
  onSetPrice,
  onToggleExcluded,
  onSetAllExcluded,
}: GeneratedProductsTableProps) => {
  const includedCount = useMemo(
    () => matrix.filter((r) => !r.isExcluded).length,
    [matrix],
  );

  if (!matrix.length) {
    return (
      <EmptyPanel>Select field values above to generate products.</EmptyPanel>
    );
  }

  if (matrix.length > 1000) {
    return (
      <EmptyPanel variant="destructive">
        <IconAlertTriangle size={16} />
        {matrix.length} combinations — too many to render. Reduce the selected
        options.
      </EmptyPanel>
    );
  }

  const allIncluded = includedCount === matrix.length;
  const headerState: boolean | 'indeterminate' =
    includedCount === 0 ? false : allIncluded ? true : 'indeterminate';

  return (
    <div className="overflow-auto max-h-[28rem] rounded-lg border">
      <Table>
        <Table.Header className="sticky top-0 z-10 bg-sidebar">
          <Table.Row>
            <Table.Head className="px-3 w-10">
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="inline-flex">
                      <Checkbox
                        checked={headerState}
                        onCheckedChange={(checked) =>
                          onSetAllExcluded(!checked)
                        }
                        aria-label="Include all"
                      />
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    {allIncluded ? 'Exclude all' : 'Include all'}
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </Table.Head>
            <Table.Head className="px-3 w-auto">Code</Table.Head>
            <Table.Head className="px-3 w-32">Unit price</Table.Head>
            {fieldIds.map((fieldId) => (
              <Table.Head key={fieldId} className="px-3 w-36">
                {fieldName(fieldId)}
              </Table.Head>
            ))}
            <Table.Head className="px-3 w-24">Status</Table.Head>
            <Table.Head className="px-3 w-16 text-center">Star</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {matrix.map((row) => {
            const isDup = !row.isExcluded && duplicateCodes?.has(row.code);
            const isStar = starRowKey ? row.key === starRowKey : row.isStar;
            return (
              <Table.Row
                key={row.key}
                className={cn(
                  row.isExcluded && 'opacity-50',
                  isDup && 'bg-destructive/5',
                )}
              >
                <Table.Cell className="px-3">
                  <Checkbox
                    checked={!row.isExcluded}
                    onCheckedChange={() =>
                      onToggleExcluded(row.key, row.isExcluded)
                    }
                    aria-label="Include product"
                  />
                </Table.Cell>
                <Table.Cell className="px-1">
                  <div className="flex gap-1 items-center">
                    <EditableCell
                      value={row.code}
                      onCommit={(code) => onSetCode(row.key, code)}
                      placeholder="code"
                      className="font-mono"
                    />
                    {isDup && (
                      <Tooltip.Provider>
                        <Tooltip>
                          <Tooltip.Trigger asChild>
                            <IconAlertTriangle
                              size={14}
                              className="mr-1 text-destructive shrink-0"
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>Duplicate code</Tooltip.Content>
                        </Tooltip>
                      </Tooltip.Provider>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="px-1">
                  <EditableCell
                    numeric
                    align="right"
                    value={
                      row.unitPrice != null
                        ? String(row.unitPrice)
                        : defaultUnitPrice != null
                          ? String(defaultUnitPrice)
                          : ''
                    }
                    placeholder="0"
                    disabled={row.isExcluded}
                    edited={
                      row.unitPrice != null &&
                      row.unitPrice !== defaultUnitPrice
                    }
                    onCommit={(next) =>
                      onSetPrice(
                        row.key,
                        next === '' ? undefined : Number(next),
                      )
                    }
                  />
                </Table.Cell>
                {fieldIds.map((fieldId) => (
                  <Table.Cell key={fieldId} className="px-3">
                    <Badge variant="secondary">
                      {labelOf(fieldId, row.combination[fieldId])}
                    </Badge>
                  </Table.Cell>
                ))}
                <Table.Cell className="px-3">{statusBadge(row)}</Table.Cell>
                <Table.Cell className="px-3 text-center">
                  <Tooltip.Provider>
                    <Tooltip>
                      <Tooltip.Trigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => onSetStar(row.key)}
                          disabled={row.isExcluded}
                        >
                          {isStar ? (
                            <IconStarFilled
                              size={14}
                              className="text-warning"
                            />
                          ) : (
                            <IconStar size={14} />
                          )}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        {isStar ? 'Star product' : 'Set as star product'}
                      </Tooltip.Content>
                    </Tooltip>
                  </Tooltip.Provider>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};
