import { createComponentImplementation } from '@erxes/assistant-catalog/react';
import { BadgeApi, StatApi, TableApi } from '@erxes/assistant-catalog';
import { REFERENCE_PATTERN } from '@erxes/core-contract';
import { Badge as UiBadge, cn, Table as UiTable } from 'erxes-ui';
import { ReferenceChip, TableChips } from '../../RecordChip';
import { numbered } from './children';

const BADGE_VARIANTS = {
  neutral: 'secondary',
  info: 'info',
  good: 'success',
  warning: 'warning',
  bad: 'destructive',
} as const;

const CHANGE_TONES = {
  neutral: 'text-muted-foreground',
  good: 'text-(--success-text)',
  bad: 'text-destructive-text',
} as const;

export const Stat = createComponentImplementation(StatApi, ({ props }) => (
  <div className="flex min-w-28 flex-1 flex-col gap-0.5 rounded-md border bg-background px-3 py-2">
    <span className="truncate text-xs text-muted-foreground">{props.label}</span>
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span className="text-base font-semibold tabular-nums">{props.value}</span>
      {props.change && (
        <span className={cn('text-xs font-medium', CHANGE_TONES[props.tone ?? 'neutral'])}>
          {props.change}
        </span>
      )}
    </span>
  </div>
));

export const Badge = createComponentImplementation(BadgeApi, ({ props }) => (
  <UiBadge variant={BADGE_VARIANTS[props.tone ?? 'neutral']} className="self-start">
    {props.text}
  </UiBadge>
));

const cellParts = (text: string) => {
  const parts: ({ at: number } & ({ text: string } | { handle: string }))[] = [];
  let from = 0;

  for (const match of text.matchAll(REFERENCE_PATTERN)) {
    if (match.index > from) parts.push({ at: from, text: text.slice(from, match.index) });

    parts.push({ at: match.index, handle: match[1] ?? '' });
    from = match.index + match[0].length;
  }

  if (from < text.length) parts.push({ at: from, text: text.slice(from) });

  return parts;
};

export const CellText = ({ text }: { text: string }) =>
  cellParts(text).map((part) =>
    'handle' in part ? (
      <ReferenceChip key={part.at} handle={part.handle} />
    ) : (
      <span key={part.at}>{part.text}</span>
    ),
  );

export const Table = createComponentImplementation(TableApi, ({ props }) => (
  <div className="min-w-0 overflow-x-auto rounded-md border">
    <UiTable>
      <UiTable.Header>
        <UiTable.Row>
          {numbered(props.columns).map(({ item: column, at }) => (
            <UiTable.Head key={at} className={column.align === 'end' ? 'text-right' : undefined}>
              {column.label}
            </UiTable.Head>
          ))}
        </UiTable.Row>
      </UiTable.Header>
      <UiTable.Body>
        <TableChips>
          {numbered(props.rows).map(({ item: row, at: line }) => (
            <UiTable.Row key={line}>
              {numbered(props.columns).map(({ item: column, at }) => (
                <UiTable.Cell
                  key={at}
                  className={column.align === 'end' ? 'text-right' : undefined}
                >
                  <div
                    className={cn(
                      'px-2 py-1.5 whitespace-normal',
                      column.align === 'end' && 'tabular-nums',
                    )}
                  >
                    <CellText text={row[at] ?? ''} />
                  </div>
                </UiTable.Cell>
              ))}
            </UiTable.Row>
          ))}
        </TableChips>
      </UiTable.Body>
    </UiTable>
  </div>
));
