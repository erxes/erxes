import { ReportTable, useQueryState, Spinner, fixNum, } from "erxes-ui"
import { useJournalReportData } from "../hooks/useJournalReportData";
import { GroupRule, GroupRules } from "../types/reportsMap";
import React from "react";
import { TR_SIDES } from "~/modules/transactions/types/constants";

export const ReportTableBody = () => {
  const [report] = useQueryState('report');
  const [groupKey] = useQueryState('groupKey');
  const colCount = GroupRules[report as string]?.colCount;
  const groupRule = GroupRules[report as string]?.groups[groupKey as string || 'default']

  const calcReport = getCalcReportHandler(report as string || '')

  const { grouped = {}, loading } = useJournalReportData();

  if (loading) {
    return <Spinner />;
  }

  return (
    <ReportRecursiveRenderer
      groupedDic={grouped}
      groupRule={groupRule}
      colCount={colCount}
      calcReport={calcReport}
    />
  )
}

interface ReportRendererProps {
  groupedDic: any;
  groupRule: GroupRule;
  colCount: number;
  groupHead?: boolean;
  calcReport: (dic: any, groupRule: GroupRule, attr: string) => React.ReactNode;
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
  groupRule: GroupRule,
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

const getCalcReportHandler = (report: string) => {
  const handlers: any = {
    // ac: handleMainAC,
    tb: HandleMainTB,
  };

  return handlers[report];
}

const HandleMainTB = (dic: any, groupRule: GroupRule, attr: string) => {
  const { items } = dic;
  let [fr_diff, tr_dt, tr_ct, lr_diff] = [0, 0, 0, 0];

  for (const rec of items) {
    if (rec.isBetween) {
      if (rec.side === TR_SIDES.DEBIT) {
        tr_dt += rec.sumAmount;
        lr_diff += rec.sumAmount;
      } else {
        tr_ct += rec.sumAmount;
        lr_diff -= rec.sumAmount;
      }
    } else {
      if (rec.side === TR_SIDES.DEBIT) {
        fr_diff += rec.sumAmount;
        lr_diff += rec.sumAmount;
      } else {
        fr_diff -= rec.sumAmount;
        lr_diff -= rec.sumAmount;
      }
    }
  }

  return (
    <>
      <ReportTable.Cell>{fr_diff > 0 && fixNum(fr_diff) || ''}</ReportTable.Cell>
      <ReportTable.Cell>{fr_diff < 0 && fixNum(-1 * fr_diff) || ''}</ReportTable.Cell>
      <ReportTable.Cell>{tr_dt}</ReportTable.Cell>
      <ReportTable.Cell>{tr_ct}</ReportTable.Cell>
      <ReportTable.Cell>{lr_diff > 0 && fixNum(lr_diff) || ''}</ReportTable.Cell>
      <ReportTable.Cell>{lr_diff < 0 && fixNum(-1 * lr_diff) || ''}</ReportTable.Cell>
    </>
  )
}