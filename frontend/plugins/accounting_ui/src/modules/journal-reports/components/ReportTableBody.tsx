import { ReportTable, Spinner, cn, displayNum, useQueryState } from 'erxes-ui';
import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJournalReportData } from '../hooks/useJournalReportData';
import { ReportRules, IGroupRule } from '../types/reportsMap';
import { getCalcReportHandler, getRenderMoreHandler } from './includes';
import { useJournalReportMore } from '../hooks/useJournalReportMore';
import { useSetAtom } from 'jotai';
import { moreDataState } from '../states/renderingReportsStates';

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

  // const params = { ...qryParams };
  const { isMore } = params;

  const colCount = reportConf.colCount ?? 0;
  const groupRule =
    reportConf.groups?.[(groupKey as string) || ''] ||
    reportConf.groups?.['default'];

  const calcReport = getCalcReportHandler((report as string) || '');

  const renderMore = getRenderMoreHandler((report as string) || '', isMore);

  const { records = [], loading, error } = useJournalReportData();
  const {
    trDetails = [],
    loading: detailLoading,
    error: detailError,
  } = useJournalReportMore();
  const setMoreData = useSetAtom(moreDataState);

  // const tableRef = useRef<HTMLTableSectionElement>(null);

  // const grouped = React.useMemo(() => {
  //   if (error) return {};

  //   return groupRecords(records, groupRule);
  // }, [records, groupRule]);

  // ✅ RENDER ДУУССАНЫ ДАРАА TOTALS БОДНО
  useEffect(() => {
    if (!tableRef?.current) return;

    totalsCalc(tableRef.current);
    if (!isMore) return;
    if (detailLoading) return;
    setMoreData(trDetails);
  }, [grouped, detailLoading]); // ✅ дата солигдох бүрт дахин бодно

  if (!report || !reportConf) {
    return 'NOT FOUND REPORT';
  }

  const tableRef = useRef<HTMLTableSectionElement>(null);

  const grouped = React.useMemo(() => {
    if (error) return {};

    return groupRecords(records, groupRule);
  }, [records, groupRule]);

  // ✅ RENDER ДУУССАНЫ ДАРАА TOTALS БОДНО
  useEffect(() => {
    if (!tableRef?.current) return;
    if (loading) return;
    if (error) return;

    totalsCalc(tableRef.current, groupRule);
  }, [grouped]); // ✅ дата солигдох бүрт дахин бодно

  useEffect(() => {
    if (!tableRef?.current) return;
    if (!isMore) return;
    if (detailLoading) return;
    if (detailError) return;
    setMoreData(moreDataByKey(moreData, trDetails, groupRule));
  }, [grouped, detailLoading]); // ✅ дата солигдох бүрт дахин бодно

  if (!report || !reportConf) {
    return 'NOT FOUND REPORT';
  }

  if (error) {
    return error.message;
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
        renderMore={isMore && renderMore}
      />
    </tbody>
  );
};

// toGroup Data
export const groupRecords = (records: any[], groupRule?: IGroupRule) => {
  if (!groupRule) {
    return { items: records };
  }

  const resultDic = {};

  toGroup(resultDic, records, groupRule);
  return resultDic;
};

type AnyDict = { [key: string]: any };

const toGroup = (
  resultDic: AnyDict,
  groupRuleItems: AnyDict[],
  groupRule: IGroupRule,
) => {
  // iterate over rows to group
  for (const item of groupRuleItems) {
    const groupKey = item[groupRule.group];

    // If group does not exist in resultDic, initialize it
    if (!resultDic[groupKey]) {
      resultDic[groupKey] = {
        items: [],
        [`${groupRule.key}_id`]: String(groupKey), // id
        [`${groupRule.key}_code`]: String(item[groupRule.code]), // code
        [`${groupRule.key}_name`]: groupRule.name
          ? String(item[groupRule.name])
          : '', // name
      };

      // if sub-group rule exists -> initialize empty dict
      if (groupRule.group_rule?.key) {
        resultDic[groupKey][groupRule.group_rule.key] = {};
      }
    }

    // get existing items under this group
    const dicItems = resultDic[groupKey]['items'] || [];

    // add current record
    dicItems.push(item);

    // reassign
    resultDic[groupKey]['items'] = dicItems;
  }

  // if sub-group rule exists, recursively call
  if (groupRule.group_rule?.key) {
    for (const key of Object.keys(resultDic)) {
      toGroup(
        resultDic[key][groupRule.group_rule.key],
        resultDic[key]['items'],
        groupRule.group_rule,
      );
      resultDic[key]['items'] = undefined;
    }
  }
};

// extract and render
interface ReportRendererProps {
  groupedDic: any;
  groupRule?: IGroupRule;
  colCount: number;
  groupHead?: boolean;
  calcReport: (
    dic: any,
    groupRule: IGroupRule,
    attr: string,
  ) => React.ReactNode;
  renderMore?: (parents: string, child: string) => React.ReactNode;
}

export function ReportRecursiveRenderer({
  groupedDic,
  groupRule,
  colCount,
  calcReport,
  renderMore,
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
        groupHead,
        calcReport,
        renderMore,
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
  groupedDic: any,
  groupRule: IGroupRule,
  colCount: number,
  padding: number,
  lastAttr: string,
  leafAttr: string,
  groupHead: boolean,
  calcReport: (
    dic: any,
    groupRule: IGroupRule,
    attr: string,
  ) => React.ReactNode,
  renderMore?: (parents: string, child: string) => React.ReactNode,
): React.ReactNode[] {
  if (!Object.keys(groupedDic || {}).length) return [];

  const grId = `${groupRule.key}_id`;
  const keyCode = `${groupRule.key}_code`;
  const keyName = `${groupRule.key}_name`;

  const sortedValues = Object.values(groupedDic).sort((a: any, b: any) =>
    String(a[keyCode]).localeCompare(String(b[keyCode])),
  );

  return sortedValues.map((grStep: any, index: number) => {
    const attr = `${lastAttr ? `${lastAttr}*` : ''}${groupRule.key}+${
      grStep[grId]
    }`;

    // ✅ Дараагийн групп байвал (recursion үргэлжилнэ)
    if (groupRule.groupRule?.group) {
      const preLeafAttr = (leafAttr && `${leafAttr},`) || '';
      const newMoreAttr = getMoreAttr(
        groupRule,
        grStep[grId],
        moreAttr,
        isMore,
      );

      return (
        <React.Fragment key={attr + index}>
          {
            <ReportTable.Row
              data-sum-key={attr}
              className={cn(groupRule.style ?? '')}
              data-group={groupRule.group}
              data-id={grStep[grId]}
            >
              <ReportTable.Cell
                className={cn(`text-left `, padding && 'pl-(--cellPadding)')}
                style={
                  { '--cellPadding': `${padding}px` } as React.CSSProperties
                }
              >
                {grStep[keyCode]}
              </ReportTable.Cell>

              <ReportTable.Cell className="text-left">
                {grStep[keyName]}
              </ReportTable.Cell>

              {Array.from({ length: colCount }).map((_, i) => (
                <ReportTable.Cell key={i} className="text-right" />
              ))}
            </ReportTable.Row>
          }

          {renderGroup(
            grStep[groupRule.groupRule.group],
            groupRule.groupRule,
            colCount,
            padding + 25,
            attr,
            `${leafAttr ? `${leafAttr},` : ''}${attr}`,
            groupHead,
            calcReport,
            renderMore,
          )}
        </React.Fragment>
      );
    }

    // ✅ Навч node
    const { lastNode, lastData } = calcReport(grStep, groupRule, attr);

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

          <ReportTable.Cell className="text-left">
            {grStep[keyName]}
          </ReportTable.Cell>

          {lastNode}
        </ReportTable.Row>
        {renderMore &&
          renderMore(leafAttr ?? '', `${groupRule.key}+${grStep[grId]}`)}
      </React.Fragment>
    );
  });
}

const totalsCalc = (root: HTMLElement) => {
  const table = document.querySelector('table[data-slot="table"]');
  if (!table) return;

  const excluded_indexes: number[] = [0, 1]; // not-sum index-үүд энд орно
  const totals: Record<string, Record<number, number>> = {};

  const rows = root.querySelectorAll('tr[data-keys]');

  rows.forEach((row) => {
    const sumKeyVals = row.getAttribute('data-keys') || '';
    const sumKeys = sumKeyVals.split(',');

    const tds = row.querySelectorAll('td');

    tds.forEach((td, index) => {
      if (excluded_indexes.includes(index)) return;

      let recordValue = parseFloat(td.textContent?.replace(/,/g, '') || '0');
      if (isNaN(recordValue)) recordValue = 0;

      Array.from(sumKeys).forEach((sumKey) => {
        if (!totals[sumKey]) totals[sumKey] = {};
        if (!totals[sumKey][index]) totals[sumKey][index] = 0;

        totals[sumKey][index] += recordValue;
      });
    });
  });

  // ✅ БОДОГДСОН ДҮНГ TABLE-Д ШАХАХ
  Object.keys(totals).forEach((rowId) => {
    const colIndexes = Object.keys(totals[rowId]);

    colIndexes.forEach((colIndex) => {
      const value = totals[rowId][Number(colIndex)];
      const childIndex = Number(colIndex) + 1;
      const selector = `tr[data-sum-key="${rowId}"] td:nth-child(${childIndex})`;
      const cell = table?.querySelector(selector);

      if (!cell) return;
      cell.textContent = displayNum(value, 2).toString();
    });
  });
};
