import { displayNum } from "erxes-ui";
import { IGroupRule } from "../../types/reportsMap";


// toGroup Data
export const groupRecords = (records: any[], groupRule?: IGroupRule) => {
  if (!groupRule) {
    return { 'items': records }
  }

  const resultDic = {};

  toGroup(resultDic, records, groupRule);
  return resultDic;
}

type AnyDict = { [key: string]: any };

export const toGroup = (
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
        [`${groupRule.group}Id`]: String(groupKey),                     // id
        [`${groupRule.group}Code`]: String(item[groupRule.code]),       // code
        [`${groupRule.group}Name`]: groupRule.name
          ? String(item[groupRule.name])
          : "",                                                       // name
      };

      // if sub-group rule exists -> initialize empty dict
      if (groupRule.groupRule?.group) {
        resultDic[groupKey][groupRule.groupRule.group] = {};
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
  if (groupRule.groupRule?.group) {
    for (const key of Object.keys(resultDic)) {
      toGroup(
        resultDic[key][groupRule.groupRule.group],
        resultDic[key]["items"],
        groupRule.groupRule
      );
      resultDic[key]["items"] = undefined
    }
  }
}

export const getFirstGroupRule = (firstGroupRule: string[], groupRule?: IGroupRule) => {
  const subGroupRule = groupRule?.groupRule;

  if (groupRule?.group && !groupRule.excMore) {
    const froms = groupRule.from && `${groupRule.from}.` || '';

    firstGroupRule.push(
      `${froms}${groupRule.group}`
    )
  }

  if (subGroupRule) {
    getFirstGroupRule(firstGroupRule, subGroupRule);
  }
  return firstGroupRule;
}

export const moreDataByKey = (moreData: { [key: string]: any[] }, trDetails: any[], groupRule?: IGroupRule) => {
  const rules = getFirstGroupRule([], groupRule);

  trDetails.forEach((tr) => {
    const key = rules
      .map(rule =>
        rule.split('.').reduce((acc, k) => acc?.[k], tr)
      )
      .join('#');

    if (!moreData[key]) {
      moreData[key] = []
    }

    moreData[key].push(tr)
  });

  return moreData;
}

export const totalsCalc = (root: HTMLElement, groupRule?: IGroupRule) => {
  const table = document.querySelector('table[data-slot="table"]');
  if (!table) return;

  const excludedIndexes = new Set([0, 1].concat(groupRule?.excTotal || [])); // not-sum index-үүд энд орно
  const totals: Record<string, Record<number, number>> = {};

  const rows = root.querySelectorAll("tr[data-keys]");

  rows.forEach(row => {
    const sumKeyVals = (row as HTMLTableRowElement).dataset.keys || '';
    const sumKeys = sumKeyVals.split(',');

    const tds = row.querySelectorAll("td");

    tds.forEach((td, index) => {
      if (excludedIndexes.has(index)) return;

      let recordValue = Number.parseFloat(td.textContent?.replace(/,/g, "") || "0");
      if (Number.isNaN(recordValue)) recordValue = 0;

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
