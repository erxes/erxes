import { ReportTable, cn } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJournalReportData } from '../hooks/useJournalReportData';
import { useJournalReportMore } from '../hooks/useJournalReportMore';
import { moreDataState } from '../states/renderingReportsStates';
import { IGroupRule, ReportRules } from '../types/reportsMap';
import {
  CalcReportHandler,
  getCalcReport,
  getRenderMoreHandler,
} from './includes';
import { groupRecords, moreDataByKey, totalsCalc } from './includes/utils';

type QueryObject = Record<string, string | string[]>;

const getStringParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export function useQueryObject(): QueryObject {
  const [searchParams] = useSearchParams();

  const obj: QueryObject = {};
  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key);
    obj[key] = values.length > 1 ? values : values[0];
  }

  return obj;
}

export const ReportTableBody = () => {
  const {
    report: reportParam,
    groupKey: groupKeyParam,
    ...params
  } = useQueryObject();
  const report = getStringParam(reportParam) || '';
  const groupKey = getStringParam(groupKeyParam);
  const reportConf = ReportRules[report];

  const isMore = getStringParam(params.isMore) === 'true';
  const unhideZero = getStringParam(params.unhideZero) === 'true';

  const colCount = reportConf?.colCount ?? 0;
  const defaultGroupKey = reportConf?.choices?.[0]?.code || 'default';
  const groupRule =
    reportConf?.groups?.[groupKey || defaultGroupKey] ||
    reportConf?.groups?.[defaultGroupKey];

  const calcReport = getCalcReport(report);

  const { records = [], loading, error } = useJournalReportData();
  const {
    trDetails = [],
    loading: detailLoading,
    error: detailError,
  } = useJournalReportMore();
  const setMoreData = useSetAtom(moreDataState);

  const tableRef = useRef<HTMLTableSectionElement>(null);

  const grouped = React.useMemo(() => {
    if (error || !groupRule) return {};

    return groupRecords(records, groupRule);
  }, [records, groupRule, error]);

  // RENDER ДУУССАНЫ ДАРАА TOTALS БОДНО
  useEffect(() => {
    if (!tableRef?.current) return;
    if (loading) return;
    if (error) return;
    if (!groupRule) return;

    totalsCalc(tableRef.current, groupRule, unhideZero);
  }, [grouped, groupRule, loading, error, unhideZero]); // дата солигдох бүрт дахин бодно

  useEffect(() => {
    if (!tableRef?.current) return;
    if (!isMore) return;
    if (detailLoading) return;
    if (detailError) return;
    if (!groupRule) return;
    setMoreData(moreDataByKey(trDetails, groupRule));
  }, [
    grouped,
    detailLoading,
    detailError,
    isMore,
    setMoreData,
    trDetails,
    groupRule,
  ]); // дата солигдох бүрт дахин бодно

  if (!report || !reportConf || !groupRule) {
    return 'NOT FOUND REPORT';
  }

  if (error) {
    return error.message;
  }
  if (detailError) {
    return detailError.message;
  }

  return (
    <tbody
      data-slot="table-body"
      ref={tableRef}
      className={cn('[&_tr:last-child]:border-0')}
    >
      <ReportRecursiveRenderer
        groupedDic={grouped}
        groupRule={groupRule}
        colCount={colCount}
        calcReport={calcReport}
        report={report}
        isMore={isMore}
      />
    </tbody>
  );
};

// extract and render
interface ReportRendererProps {
  groupedDic: Record<string, unknown>;
  groupRule?: IGroupRule;
  colCount: number;
  calcReport: CalcReportHandler;
  report: string;
  isMore?: boolean;
}

export function ReportRecursiveRenderer({
  groupedDic,
  groupRule,
  colCount,
  calcReport,
  report,
  isMore,
}: ReportRendererProps) {
  return (
    <>
      {renderGroup(
        groupedDic,
        groupRule || ({} as IGroupRule),
        colCount,
        0,
        '',
        '',
        calcReport,
        report,
        isMore,
        '',
      )}
    </>
  );
}

const getMoreAttr = (
  groupRule: IGroupRule,
  grId: string,
  moreAttr?: string,
  isMore?: boolean,
) => {
  if (isMore && !groupRule.excMore) {
    const preMoreAttr = moreAttr ? `${moreAttr}#` : '';
    return `${preMoreAttr}${grId}`;
  }
  return moreAttr;
};

function renderGroup(
  groupedDic: Record<string, unknown>,
  groupRule: IGroupRule,
  colCount: number,
  padding: number,
  lastAttr: string,
  leafAttr: string,
  calcReport: CalcReportHandler,
  report: string,
  isMore?: boolean,
  moreAttr?: string,
): React.ReactNode[] {
  if (!Object.keys(groupedDic || {}).length) return [];

  const grId = `${groupRule.group}Id`;
  const keyCode = `${groupRule.group}Code`;
  const keyName = `${groupRule.group}Name`;

  const sortedValues = Object.values(groupedDic).sort((a, b) =>
    String((a as Record<string, unknown>)[keyCode]).localeCompare(
      String((b as Record<string, unknown>)[keyCode]),
    ),
  );

  return sortedValues.map((grStepValue, index: number) => {
    const grStep = grStepValue as Record<string, unknown>;
    const lAttr = lastAttr ? `${lastAttr}*` : '';
    const attr = `${lAttr}${groupRule.group}+${grStep[grId]}`;

    // Дараагийн групп байвал (recursion үргэлжилнэ)
    if (groupRule.groupRule?.group) {
      const preLeafAttr = (leafAttr && `${leafAttr},`) || '';
      const newMoreAttr = getMoreAttr(
        groupRule,
        String(grStep[grId] ?? ''),
        moreAttr,
        isMore,
      );

      return (
        <React.Fragment key={attr + index}>
          {
            <ReportTable.Row
              key={attr}
              data-sum-key={attr}
              className={cn(groupRule.style ?? '')}
              data-group={groupRule.group}
              data-id={String(grStep[grId] ?? '')}
            >
              <ReportTable.Cell
                className={cn(`text-left `, padding && 'pl-(--cellPadding)')}
                style={
                  { '--cellPadding': `${padding}px` } as React.CSSProperties
                }
              >
                {String(grStep[keyCode] ?? '')}
              </ReportTable.Cell>

              <ReportTable.Cell className="text-left">
                {String(grStep[keyName] ?? '')}
              </ReportTable.Cell>

              {Array.from({ length: colCount }).map((_, i) => (
                <ReportTable.Cell key={`${attr}-${i}`} className="text-right" />
              ))}
            </ReportTable.Row>
          }

          {renderGroup(
            grStep[groupRule.groupRule.group] as Record<string, unknown>,
            groupRule.groupRule,
            colCount,
            padding + 25,
            attr,
            `${preLeafAttr}${attr}`,
            calcReport,
            report,
            isMore,
            newMoreAttr,
          )}
        </React.Fragment>
      );
    }

    // Навч node
    const { lastNode, lastData } = calcReport(grStep, groupRule, attr);

    if (!lastNode) return null;

    return (
      <React.Fragment key={attr}>
        <ReportTable.Row
          key={attr}
          data-keys={['footer', leafAttr].filter(Boolean).join(',')}
          className={cn('text-right', groupRule.style ?? '')}
          data-group={groupRule.group}
          data-id={String(grStep[grId] ?? '')}
        >
          <ReportTable.Cell
            className={cn(`text-left `, padding && 'pl-(--cellPadding)')}
            style={{ '--cellPadding': `${padding}px` } as React.CSSProperties}
          >
            {String(grStep[keyCode] ?? '')}
          </ReportTable.Cell>

          <ReportTable.Cell className="text-left">
            {String(grStep[keyName] ?? '')}
          </ReportTable.Cell>

          {lastNode}
        </ReportTable.Row>
        {isMore && (
          <RenderMore
            report={report}
            treeIds={moreAttr ?? ''}
            leafId={`${grStep[grId]}`}
            nodeExtra={lastData}
          />
        )}
      </React.Fragment>
    );
  });
}

const RenderMore = ({
  report,
  treeIds,
  leafId,
  nodeExtra,
}: {
  report: string;
  treeIds: string;
  leafId: string;
  nodeExtra?: Record<string, unknown>;
}) => {
  const ReportMore = getRenderMoreHandler(report);

  const treeIdsStr = treeIds ? `${treeIds}#` : '';
  const perkey = `${treeIdsStr}${leafId}`;

  const allMoreData = useAtomValue(moreDataState);
  const moreData = useMemo(() => {
    return allMoreData?.[perkey] || [];
  }, [perkey, allMoreData]);

  if (!ReportMore) {
    return null;
  }

  // moreData Context
  return (
    <ReportMore moreData={moreData} currentKey={perkey} nodeExtra={nodeExtra} />
  );
};
