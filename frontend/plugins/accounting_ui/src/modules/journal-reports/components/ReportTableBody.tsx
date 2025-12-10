import { ReportTable, useQueryState, Spinner, } from "erxes-ui"
import { useJournalReportData } from "../hooks/useJournalReportData";
import { IGroupRule, GroupRules } from "../types/reportsMap";
import React from "react";
import { getCalcReportHandler } from "./includes";

export const ReportTableBody = () => {
  const [report] = useQueryState('report');
  const [groupKey] = useQueryState('groupKey');
  const colCount = GroupRules[report as string]?.colCount;
  const groupRule = GroupRules[report as string]?.groups[groupKey as string || 'default']

  const calcReport = getCalcReportHandler(report as string || '')

  const { records = [], loading } = useJournalReportData();

  if (loading) {
    return <Spinner />;
  }

  const grouped = groupRecords(records, groupRule);

  return (
    <ReportRecursiveRenderer
      groupedDic={grouped}
      groupRule={groupRule}
      colCount={colCount}
      calcReport={calcReport}
    />
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

  sortGroupByCode(resultDic, `${groupRule.key}_code`);

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

function sortGroupByCode(resultDic: AnyDict, sortKey: string) {
  const sortedEntries = Object.entries(resultDic).sort((a: any, b: any) => {
    const aCode = a[1]?.[sortKey] ?? "";
    const bCode = b[1]?.[sortKey] ?? "";
    return String(aCode).localeCompare(String(bCode), "mn");
  });

  // object-г дахин build хийнэ (JS object өөрөө сортлогддоггүй)
  Object.keys(resultDic).forEach(k => delete resultDic[k]);

  for (const [k, v] of sortedEntries) {
    resultDic[k] = v;
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
  const grCode = `${groupRule.key}_code`;
  const keyCode = `${groupRule.key}_code`;
  const keyName = `${groupRule.key}_name`;

  const sortedValues = Object.values(groupedDic).sort(
    (a: any, b: any) => String(a[grCode]).localeCompare(String(b[grCode]))
  );

  return sortedValues.map((grStep: any, index: number) => {
    const attr = `data-value-${lastAttr}-${groupRule.key}-${grStep[grId]}`
      .replace(/--/g, "-")
      .replace(/ -/g, "-")
      .replace(/- /g, "-");

    const childAttr = `data-value sum ${leafAttr.replace("data-value-", "")}`;

    // ✅ Дараагийн групп байвал (recursion үргэлжилнэ)
    if (groupRule.group_rule?.key) {
      return (
        <React.Fragment key={attr + index}>
          {groupHead && (
            <ReportTable.Row
              data-value={attr}
              className={groupRule.format ?? ''}
              i-group={groupRule.group}
              i-id={grStep[grId]}
            >
              <ReportTable.Cell
                style={{ paddingLeft: `${padding}px`, textAlign: "left" }}
              >
                {grStep[keyCode]}
              </ReportTable.Cell>

              <ReportTable.Cell style={{ textAlign: "left" }}>
                {grStep[keyName]}
              </ReportTable.Cell>

              {Array.from({ length: colCount }).map((_, i) => (
                <ReportTable.Cell key={i} />
              ))}
            </ReportTable.Row>
          )}

          {renderGroup(
            grStep[groupRule.group_rule.key],
            groupRule.group_rule,
            colCount,
            padding + 30,
            attr,
            leafAttr + attr,
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
        style={{ textAlign: "right", ...(groupRule.style ? { cssText: groupRule.style } : {}) }}
        data-value={childAttr}
        className={groupRule.format}
        i-group={groupRule.group}
        i-id={grStep[grId]}
      >
        <ReportTable.Cell
          style={{ paddingLeft: `${padding}px`, textAlign: "left" }}
        >
          {grStep[keyCode]}
        </ReportTable.Cell>

        <ReportTable.Cell style={{ textAlign: "left" }}>
          {grStep[keyName]}
        </ReportTable.Cell>

        {lastNode}
      </ReportTable.Row>
    );
  });
}
