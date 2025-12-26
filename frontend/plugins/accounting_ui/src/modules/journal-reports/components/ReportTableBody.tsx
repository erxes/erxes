import { ReportTable, cn } from "erxes-ui";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useJournalReportData } from "../hooks/useJournalReportData";
import { useJournalReportMore } from "../hooks/useJournalReportMore";
import { moreDataState } from "../states/renderingReportsStates";
import { IGroupRule, ReportRules } from "../types/reportsMap";
import { getCalcReportHandler, getRenderMoreHandler } from "./includes";
import { groupRecords, moreDataByKey, totalsCalc } from "./includes/utils";

export function useQueryObject() {
  const [searchParams] = useSearchParams();

  const obj: any = {};
  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key);
    obj[key] = values.length > 1 ? values : values[0];
  }

  return obj;
}

export const ReportTableBody = () => {
  const { report, groupKey, ...params } = useQueryObject();
  const reportConf = ReportRules[report as string];

  const { isMore } = params;

  const colCount = reportConf.colCount ?? 0;
  const groupRule = reportConf.groups?.[groupKey as string || ''] || reportConf.groups?.['default'];

  const calcReport = getCalcReportHandler(report as string || '')

  const RenderMore = getRenderMoreHandler(report as string || '', isMore);

  const { records = [], loading, error } = useJournalReportData();
  const { trDetails = [], loading: detailLoading, error: detailError } = useJournalReportMore()
  const [moreData, setMoreData] = useAtom(
    moreDataState,
  );

  const tableRef = useRef<HTMLTableSectionElement>(null);

  const grouped = React.useMemo(() => {
    if (error) return {};

    return groupRecords(records, groupRule);
  }, [records, groupRule]);

  // ✅ RENDER ДУУССАНЫ ДАРАА TOTALS БОДНО
  useEffect(() => {
    if (!tableRef?.current) return;

    totalsCalc(tableRef.current);
  }, [grouped]); // ✅ дата солигдох бүрт дахин бодно

  useEffect(() => {
    if (!tableRef?.current) return;
    if (!isMore) return;
    if (detailLoading) return;
    if (detailError) return;
    setMoreData(moreDataByKey(moreData, trDetails, groupRule));
  }, [grouped, detailLoading]); // ✅ дата солигдох бүрт дахин бодно

  if (!report || !reportConf) {
    return 'NOT FOUND REPORT'
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
      // RenderMore={isMore && RenderMore}
      />
    </tbody>
  )
}

// extract and render 
interface ReportRendererProps {
  groupedDic: any;
  groupRule?: IGroupRule;
  colCount: number;
  calcReport: (dic: any, groupRule: IGroupRule, attr: string) => React.ReactNode;
  // RenderMore?: (parents: string, child: string) => React.ReactNode;
}

export function ReportRecursiveRenderer({
  groupedDic,
  groupRule,
  colCount,
  calcReport,
  // RenderMore,
}: ReportRendererProps) {
  return (
    <>
      {renderGroup(
        groupedDic,
        groupRule || {} as IGroupRule,
        colCount,
        0,
        "",
        "",
        calcReport,
        // RenderMore,
      )}
    </>
  );
}

function renderGroup(
  groupedDic: any,
  groupRule: IGroupRule,
  colCount: number,
  padding: number,
  lastAttr: string,
  leafAttr: string,
  calcReport: (dic: any, groupRule: IGroupRule, attr: string) => React.ReactNode,
  // RenderMore?: (parents: string, child: string, groupRule?: IGroupRule[]) => React.ReactNode,
): React.ReactNode[] {
  if (!Object.keys(groupedDic || {}).length) return [];

  const grId = `${groupRule.group}Id`;
  const keyCode = `${groupRule.group}Code`;
  const keyName = `${groupRule.group}Name`;

  const sortedValues = Object.values(groupedDic).sort(
    (a: any, b: any) => String(a[keyCode]).localeCompare(String(b[keyCode]))
  );

  return sortedValues.map((grStep: any, index: number) => {
    const lAttr = lastAttr ? `${lastAttr}*` : '';
    const attr = `${lAttr}${groupRule.group}+${grStep[grId]}`

    // ✅ Дараагийн групп байвал (recursion үргэлжилнэ)
    if (groupRule.groupRule?.group) {
      return (
        <React.Fragment key={attr + index}>
          {(
            <ReportTable.Row
              key={attr}
              data-sum-key={attr}
              className={cn(groupRule.style ?? '')}
              data-group={groupRule.group}
              data-id={grStep[grId]}
            >
              <ReportTable.Cell
                className={cn(`text-left `, padding && 'pl-(--cellPadding)')}
                style={{ '--cellPadding': `${padding}px` } as React.CSSProperties}
              >
                {grStep[keyCode]}
              </ReportTable.Cell>

              <ReportTable.Cell className="text-left">
                {grStep[keyName]}
              </ReportTable.Cell>

              {Array.from({ length: colCount }).map((_, i) => (
                <ReportTable.Cell key={`${attr}-${i}`} className="text-right" />
              ))}
            </ReportTable.Row>
          )}

          {renderGroup(
            grStep[groupRule.groupRule.group],
            groupRule.groupRule,
            colCount,
            padding + 25,
            attr,
            `${leafAttr && `${leafAttr},` || ''}${attr}`,
            calcReport,
            // RenderMore
          )}
        </React.Fragment>
      );
    }

    // ✅ Навч node
    const lastNode = calcReport(grStep, groupRule, attr);

    if (!lastNode) return null;

    return (
      <React.Fragment key={attr}>
        <ReportTable.Row
          key={attr}
          data-keys={`footer,${leafAttr}`}
          className={cn('text-right', groupRule.style ?? '')}
          data-group={groupRule.group}
          data-id={grStep[grId]}
        >
          <ReportTable.Cell
            className={cn(`text-left `, padding && 'pl-(--cellPadding)')}
            style={{ '--cellPadding': `${padding}px` } as React.CSSProperties}
          >
            {grStep[keyCode]}
          </ReportTable.Cell>

          <ReportTable.Cell className='text-left'>
            {grStep[keyName]}
          </ReportTable.Cell>

          {lastNode}
        </ReportTable.Row>
        <RenderMore parentRules={leafAttr?.split(',').slice(-1)[0] || ''} leafRule={`${groupRule.group}+${grStep[grId]}`} />
      </React.Fragment>
    );
  });
}

const RenderMore = ({ parentRules, leafRule }: { parentRules: string, leafRule: string }) => {
  const parents = parentRules.split('*').map(p => p.split('+'));
  const [leafGroup, leafId] = leafRule.split('+');
  const perkey = `${parents?.map(pr => pr[1]).join('#')}#${leafId}`;
  const allMoreData = useAtomValue(moreDataState);

  const moreData = useMemo(() => { return allMoreData?.[perkey] || []; }, [perkey, allMoreData]);

  // moreData Context
  return (
    <ReportTable.Row
      key={perkey}
      className={cn('text-right')}
    >
      <ReportTable.Cell colSpan={8} className="p-0">
        <ReportTable>
          <ReportTable.Header>

          </ReportTable.Header>
          <ReportTable.Body >
            {moreData.map(tr => (
              <ReportTable.Row
                className={cn('')}
              >
                <ReportTable.Cell
                  className={cn(`text-left `)}
                >
                  {parents}
                </ReportTable.Cell>
                <ReportTable.Cell className="text-left">
                  {leafId}
                </ReportTable.Cell>
                <ReportTable.Cell className="text-left">
                  {tr.date}
                </ReportTable.Cell>
                <ReportTable.Cell className="text-left">
                  {tr.description}
                </ReportTable.Cell>

              </ReportTable.Row>
            ))}
          </ReportTable.Body>
          <ReportTable.Footer>
          </ReportTable.Footer>
        </ReportTable>
      </ReportTable.Cell>
    </ReportTable.Row>
  )
}
