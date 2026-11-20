import { createElement, forwardRef, HTMLAttributes, ReactNode } from 'react';
import { ReportValues } from '@/tunable-reports/schema';

type ReportRow = ReportValues['sections'][number]['rows'][number];

export const reportRow = (
  _id: string,
  name: string,
  extra: Partial<ReportRow> = {},
): ReportRow => ({
  _id,
  name,
  code: '',
  number: _id,
  order: 0,
  isActive: true,
  kind: 'formula',
  valueSide: 'call_value',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  tabCount: 0,
  ...extra,
});

const plain = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
const element = (tag: 'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td') =>
  forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>((props, ref) =>
    createElement(tag, { ...props, ref }),
  );

export const tableMock = Object.assign(element('table'), {
  Header: element('thead'),
  Body: element('tbody'),
  Row: element('tr'),
  Head: element('th'),
  Cell: element('td'),
});

export const sheetMock = Object.assign(
  ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  {
    View: plain,
    Header: plain,
    Content: plain,
    Description: plain,
    Footer: plain,
    Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Close: () => null,
  },
);
