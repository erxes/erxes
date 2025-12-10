import { ReportTable, useQueryState, Spinner, cn, displayNum } from "erxes-ui"
import { useJournalReportData } from "../hooks/useJournalReportData";
import { IGroupRule, GroupRules } from "../types/reportsMap";
import React, { useEffect, useRef } from "react";
import { getCalcReportHandler } from "./includes";

export const ReportTableBody = () => {
  const [report] = useQueryState('report');
  const [groupKey] = useQueryState('groupKey');
  const reportConf = GroupRules[report as string] || {}
  const colCount = reportConf.colCount ?? 0;
  const groupRule = reportConf.groups[groupKey as string || ''] || reportConf.groups['default'] || {}

  const calcReport = getCalcReportHandler(report as string || '')

  const { records = [], loading } = useJournalReportData();

  const tableRef = useRef<HTMLTableSectionElement>(null);

  const grouped = React.useMemo(() => {
    return groupRecords(records, groupRule);
  }, [records, groupRule]);


  // ✅ RENDER ДУУССАНЫ ДАРАА TOTALS БОДНО
  useEffect(() => {
    if (!tableRef?.current) return;
    totalsCalc(tableRef.current);
  }, [grouped]); // ✅ дата солигдох бүрт дахин бодно

  if (loading) {
    return <Spinner />;
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
      />
    </tbody>
  )
}

// toGroup Data
export const groupRecords = (records: any[], groupRule: IGroupRule) => {
  if (!groupRule) {
    return { 'items': records }
  }

  const resultDic = {};

  toGroup(resultDic, records, groupRule);
  return resultDic;
}

type AnyDict = { [key: string]: any };

const toGroup = (
  resultDic: AnyDict,
  groupRuleItems: AnyDict[],
  groupRule: IGroupRule
) => {
  // iterate over rows to group
  for (const item of groupRuleItems) {
    const groupKey = item[groupRule.group];

    // If group does not exist in resultDic, initialize it
    if (!resultDic[groupKey]) {
      resultDic[groupKey] = {
        items: [],
        [`${groupRule.key}_id`]: String(groupKey),                     // id
        [`${groupRule.key}_code`]: String(item[groupRule.code]),       // code
        [`${groupRule.key}_name`]: groupRule.name
          ? String(item[groupRule.name])
          : "",                                                       // name
      };

      // if sub-group rule exists -> initialize empty dict
      if (groupRule.group_rule?.key) {
        resultDic[groupKey][groupRule.group_rule.key] = {};
      }
    }

    // get existing items under this group
    const dicItems = resultDic[groupKey]["items"] || [];

    // add current record
    dicItems.push(item);

    // reassign
    resultDic[groupKey]["items"] = dicItems;
  }

  // if sub-group rule exists, recursively call
  if (groupRule.group_rule?.key) {
    for (const key of Object.keys(resultDic)) {
      toGroup(
        resultDic[key][groupRule.group_rule.key],
        resultDic[key]["items"],
        groupRule.group_rule
      );
      resultDic[key]["items"] = undefined
    }
  }
}

// extract and render 
interface ReportRendererProps {
  groupedDic: any;
  groupRule: IGroupRule;
  colCount: number;
  groupHead?: boolean;
  calcReport: (dic: any, groupRule: IGroupRule, attr: string) => React.ReactNode;
}

export function ReportRecursiveRenderer({
  groupedDic,
  groupRule,
  colCount,
  groupHead = true,
  calcReport,
}: ReportRendererProps) {
  return (
    <>
      {renderGroup(
        groupedDic,
        groupRule,
        colCount,
        0,
        "",
        "",
        groupHead,
        calcReport
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
  groupHead: boolean,
  calcReport: Function
): React.ReactNode[] {
  if (!Object.keys(groupedDic || {}).length) return [];

  const grId = `${groupRule.key}_id`;
  const keyCode = `${groupRule.key}_code`;
  const keyName = `${groupRule.key}_name`;

  const sortedValues = Object.values(groupedDic).sort(
    (a: any, b: any) => String(a[keyCode]).localeCompare(String(b[keyCode]))
  );

  return sortedValues.map((grStep: any, index: number) => {
    const attr = `${lastAttr && `${lastAttr}*` || ''}${groupRule.key}+${grStep[grId]}`

    // ✅ Дараагийн групп байвал (recursion үргэлжилнэ)
    if (groupRule.group_rule?.key) {
      return (
        <React.Fragment key={attr + index}>
          {groupHead && (
            <ReportTable.Row
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
                <ReportTable.Cell key={i} className="text-right" />
              ))}
            </ReportTable.Row>
          )}

          {renderGroup(
            grStep[groupRule.group_rule.key],
            groupRule.group_rule,
            colCount,
            padding + 25,
            attr,
            `${leafAttr && `${leafAttr},` || ''}${attr}`,
            groupHead,
            calcReport
          )}
        </React.Fragment>
      );
    }

    // ✅ Навч node
    const lastNode = calcReport(grStep, groupRule, attr);

    if (!lastNode) return null;

    return (
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
    );
  });
}

export function totalsCalc(root: HTMLElement) {
  const table = document.querySelector('table[data-slot="table"]');
  if (!table) return;

  const excluded_indexes: number[] = [0, 1]; // not-sum index-үүд энд орно
  const totals: Record<string, Record<number, number>> = {};

  const rows = root.querySelectorAll("tr[data-keys]");

  rows.forEach(row => {
    const sumKeyVals = row.getAttribute("data-keys") || '';
    const sumKeys = sumKeyVals.split(',');

    const tds = row.querySelectorAll("td");

    tds.forEach((td, index) => {
      if (excluded_indexes.includes(index)) return;

      let recordValue = parseFloat(td.textContent?.replace(/,/g, "") || "0");
      if (isNaN(recordValue)) recordValue = 0;

      Array.from(sumKeys).forEach(sumKey => {
        if (!totals[sumKey]) totals[sumKey] = {};
        if (!totals[sumKey][index]) totals[sumKey][index] = 0;

        totals[sumKey][index] += recordValue;
      });
    });
  });

  // ✅ БОДОГДСОН ДҮНГ TABLE-Д ШАХАХ
  Object.keys(totals).forEach(rowId => {
    const colIndexes = Object.keys(totals[rowId]);

    colIndexes.forEach(colIndex => {
      const value = totals[rowId][Number(colIndex)];
      const childIndex = Number(colIndex) + 1;
      const selector = `tr[data-sum-key="${rowId}"] td:nth-child(${childIndex})`;
      const cell = table?.querySelector(selector);

      if (!cell) return;
      cell.textContent = displayNum(value, 2).toString();
    });
  });
}
