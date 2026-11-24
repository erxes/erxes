import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useWatch } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { Form, Table } from 'erxes-ui';
import { ReportForm } from '@/tunable-reports/fields';
import { REPORT_DETAIL, REPORT_LIST } from '@/tunable-reports/graphql';
import { useReportTranslation } from '@/tunable-reports/locales';
import { ReferenceSelect } from '@/tunable-reports/ReferenceSelect';

const INHERIT = '__inherit';

export const FormulaReferenceFields = ({
  form,
  sectionIndex,
  formulaIndex,
  operand,
  reportId: currentReportId,
}: {
  form: ReportForm;
  sectionIndex: number;
  formulaIndex: number;
  operand: 'source' | 'ratioSource';
  reportId?: string;
}) => {
  const { t } = useReportTranslation();
  const path =
    `sections.${sectionIndex}.formulas.${formulaIndex}.${operand}` as const;
  const source = useWatch({ control: form.control, name: path });
  const sections = useWatch({ control: form.control, name: 'sections' });
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebounce(searchValue, 300);
  const list = useQuery(REPORT_LIST, {
    variables: { page: 1, perPage: 100, searchValue: debouncedSearch },
  });
  const external = !!source?.reportId && source.reportId !== currentReportId;
  const detail = useQuery(REPORT_DETAIL, {
    variables: { _id: source?.reportId || '' },
    skip: !external,
  });
  const externalReport = detail.data?.accountingTunableReportDetail;
  const sourceSections = external ? externalReport?.sections ?? [] : sections;
  const compatibleSections = sourceSections.filter(
    (section) => section.formulaType === sections[sectionIndex]?.formulaType,
  );
  const sourceSection = compatibleSections.find(
    (section) =>
      section._id === (source?.sectionId || sections[sectionIndex]?._id),
  );
  const setSource = (reportId?: string, sectionId?: string) =>
    form.setValue(
      path,
      { reportId, sectionId, rowId: '' },
      { shouldDirty: true },
    );
  return (
    <>
      <Table.Cell className="border-l">
        <ReferenceSelect
          scope={`${path}.reportId`}
          label={t('sourceReport')}
          value={source?.reportId || INHERIT}
          selectedLabel={
            externalReport && `${externalReport.code} ${externalReport.name}`
          }
          search={{
            value: searchValue,
            placeholder: t('search'),
            onChange: setSearchValue,
          }}
          loading={list.loading}
          error={list.error}
          options={[
            { value: INHERIT, label: t('sameReport') },
            ...(list.data?.accountingTunableReports.list ?? [])
              .filter((report) => report._id !== currentReportId)
              .map((report) => ({
                value: report._id,
                label: `${report.code} ${report.name}`,
              })),
          ]}
          onChange={(id) => setSource(id === INHERIT ? undefined : id)}
        />
      </Table.Cell>
      <Table.Cell>
        <ReferenceSelect
          scope={`${path}.sectionId`}
          label={t('sourceSection')}
          value={source?.sectionId || INHERIT}
          loading={detail.loading}
          error={detail.error}
          options={[
            ...(!external ? [{ value: INHERIT, label: t('sameSection') }] : []),
            ...compatibleSections.map((section) => ({
              value: section._id,
              label: section.name || t('section'),
            })),
          ]}
          onChange={(id) =>
            setSource(source?.reportId, id === INHERIT ? undefined : id)
          }
        />
      </Table.Cell>
      <Table.Cell>
        <Form.Field
          control={form.control}
          name={`${path}.rowId`}
          render={({ field }) => (
            <Form.Item className="space-y-0">
              <ReferenceSelect
                scope={field.name}
                label={t(operand)}
                value={field.value}
                options={(sourceSection?.rows ?? []).map((row) => ({
                  value: row._id,
                  label: `${row.number || ''} ${row.name || t('formulaRow')}`,
                }))}
                onChange={field.onChange}
              />
              <Form.Message className="px-2 pb-1" />
            </Form.Item>
          )}
        />
      </Table.Cell>
      <Table.Cell className="border-r">
        <Form.Field
          control={form.control}
          name={`${path}.columnId`}
          render={({ field }) => (
            <ReferenceSelect
              scope={field.name}
              label={t('sourceColumn')}
              value={field.value || INHERIT}
              options={[
                { value: INHERIT, label: t('periodContext') },
                ...(sourceSection?.columns ?? []).map((column) => ({
                  value: column._id,
                  label: column.name || t('columns'),
                })),
              ]}
              onChange={(id) => field.onChange(id === INHERIT ? undefined : id)}
            />
          )}
        />
      </Table.Cell>
    </>
  );
};
