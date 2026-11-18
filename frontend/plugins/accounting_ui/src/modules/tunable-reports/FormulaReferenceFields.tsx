import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useWatch } from 'react-hook-form';
import { Input, Spinner } from 'erxes-ui';
import { ReportForm, ChoiceSetting, Choice } from '@/tunable-reports/fields';
import { REPORT_DETAIL, REPORT_LIST } from '@/tunable-reports/graphql';
import { useReportTranslation } from '@/tunable-reports/locales';

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
  const list = useQuery(REPORT_LIST, {
    variables: { page: 1, perPage: 100, searchValue },
  });
  const external = !!source?.reportId && source.reportId !== currentReportId;
  const detail = useQuery(REPORT_DETAIL, {
    variables: { _id: source?.reportId || '' },
    skip: !external,
  });
  const sourceSections = external
    ? detail.data?.accountingTunableReportDetail.sections ?? []
    : sections;
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
    <div className="min-w-80 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <p className="text-sm">{t('sourceReport')}</p>
          <Input
            aria-label={t('search')}
            placeholder={t('search')}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Choice
            label={t('sourceReport')}
            value={source?.reportId || '__inherit'}
            options={[
              { value: '__inherit', label: t('sameReport') },
              ...(list.data?.accountingTunableReports.list ?? [])
                .filter((report) => report._id !== currentReportId)
                .map((report) => ({
                  value: report._id,
                  label: `${report.code} ${report.name}`,
                })),
            ]}
            onChange={(id) => setSource(id === '__inherit' ? undefined : id)}
          />
          {list.loading && <Spinner size="sm" />}
          {list.error && <p role="alert">{list.error.message}</p>}
        </div>
        <div className="space-y-2">
          <p className="text-sm">{t('sourceSection')}</p>
          <Choice
            label={t('sourceSection')}
            value={source?.sectionId || '__inherit'}
            options={[
              ...(!external
                ? [{ value: '__inherit', label: t('sameSection') }]
                : []),
              ...compatibleSections.map((section) => ({
                value: section._id,
                label: section.name || t('section'),
              })),
            ]}
            onChange={(id) =>
              setSource(source?.reportId, id === '__inherit' ? undefined : id)
            }
          />
          {detail.loading && <Spinner size="sm" />}
          {detail.error && <p role="alert">{detail.error.message}</p>}
        </div>
        <ChoiceSetting
          form={form}
          name={`${path}.rowId`}
          label={t('source')}
          options={(sourceSection?.rows ?? []).map((row) => ({
            value: row._id,
            label: `${row.number || ''} ${row.name || t('formulaRow')}`,
          }))}
        />
        <ChoiceSetting
          form={form}
          name={`${path}.columnId`}
          label={t('sourceColumn')}
          options={[
            { value: '__inherit', label: t('periodContext') },
            ...(sourceSection?.columns ?? []).map((column) => ({
              value: column._id,
              label: column.name || t('columns'),
            })),
          ]}
        />
      </div>
    </div>
  );
};
