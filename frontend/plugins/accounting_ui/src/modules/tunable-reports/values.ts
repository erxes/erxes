import { nanoid } from 'nanoid';
import {
  reportFormSchema,
  reportSectionInputSchema,
  ReportValues,
  ReportSection,
} from '@/tunable-reports/schema';
import { AccountingTunableReportFieldsFragment } from '~/gql/graphql';

export const reportId = (): string => nanoid();
export const newColumn = (name = ''): ReportSection['columns'][number] => ({
  _id: reportId(),
  name,
  code: '',
  order: 0,
  isActive: true,
  getDate: 'last',
});
export const newRow = () => ({
  _id: reportId(),
  name: '',
  kind: 'formula' as const,
});
export const newSection = (name = ''): ReportSection =>
  reportSectionInputSchema.parse({
    _id: reportId(),
    name,
    columns: [],
    rows: [],
    formulas: [],
  });
export const newReport = (name: string): ReportValues =>
  reportFormSchema.parse({
    code: 'NEW',
    name,
    sections: [newSection()],
  });
export const reportValues = (
  report: AccountingTunableReportFieldsFragment,
): ReportValues => {
  // GraphQL nulls and __typename are transport metadata, not editable form values.
  const plain: unknown = JSON.parse(
    JSON.stringify(report, (key, value: unknown) =>
      key === '__typename' || value === null ? undefined : value,
    ),
  );
  return reportFormSchema.parse(plain);
};
export const orderedReport = (values: ReportValues): ReportValues => ({
  ...values,
  sections: values.sections.map((section, order) => ({
    ...section,
    order,
    columns: section.columns.map((column, order) => ({ ...column, order })),
    rows: section.rows.map((row, order) => ({ ...row, order })),
  })),
});
export const sortReportValues = (values: ReportValues): ReportValues => ({
  ...values,
  sections: [...values.sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      columns: [...section.columns].sort((a, b) => a.order - b.order),
      rows: [...section.rows].sort((a, b) => a.order - b.order),
    })),
});
