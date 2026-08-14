import { displayNum } from 'erxes-ui';
import { IGroupRule } from '../../types/reportsMap';

type ReportRecord = Record<string, unknown>;
type GroupedRecords = Record<string, ReportRecord>;

// toGroup Data
export const groupRecords = (
  records: ReportRecord[],
  groupRule?: IGroupRule,
) => {
  if (!groupRule) {
    return { items: records };
  }

  const resultDic: GroupedRecords = {};

  toGroup(resultDic, records, groupRule);
  return resultDic;
};

export const toGroup = (
  resultDic: GroupedRecords,
  groupRuleItems: ReportRecord[],
  groupRule: IGroupRule,
) => {
  // iterate over rows to group
  for (const item of groupRuleItems) {
    const groupKey = String(item[groupRule.group] ?? '');

    // If group does not exist in resultDic, initialize it
    if (!resultDic[groupKey]) {
      resultDic[groupKey] = {
        items: [],
        [`${groupRule.group}Id`]: String(groupKey), // id
        [`${groupRule.group}Code`]: String(item[groupRule.code]), // code
        [`${groupRule.group}Name`]: groupRule.name
          ? String(item[groupRule.name])
          : '', // name
      };

      // if sub-group rule exists -> initialize empty dict
      if (groupRule.groupRule?.group) {
        resultDic[groupKey][groupRule.groupRule.group] = {};
      }
    }

    // get existing items under this group
    const dicItems = (resultDic[groupKey].items || []) as ReportRecord[];

    // add current record
    dicItems.push(item);

    // reassign
    resultDic[groupKey]['items'] = dicItems;
  }

  // if sub-group rule exists, recursively call
  if (groupRule.groupRule?.group) {
    for (const key of Object.keys(resultDic)) {
      toGroup(
        resultDic[key][groupRule.groupRule.group] as GroupedRecords,
        resultDic[key].items as ReportRecord[],
        groupRule.groupRule,
      );
      resultDic[key].items = undefined;
    }
  }
};

export const getFirstGroupRule = (
  firstGroupRule: string[],
  groupRule?: IGroupRule,
) => {
  const subGroupRule = groupRule?.groupRule;

  if (groupRule?.group && !groupRule.excMore) {
    const froms = (groupRule.from && `${groupRule.from}.`) || '';

    firstGroupRule.push(`${froms}${groupRule.group}`);
  }

  if (subGroupRule) {
    getFirstGroupRule(firstGroupRule, subGroupRule);
  }
  return firstGroupRule;
};

export const moreDataByKey = (
  trDetails: ReportRecord[],
  groupRule?: IGroupRule,
) => {
  const rules = getFirstGroupRule([], groupRule);
  const nextMoreData: Record<string, ReportRecord[]> = {};

  trDetails.forEach((tr) => {
    const key = rules
      .map((rule) =>
        rule
          .split('.')
          .reduce<unknown>(
            (acc, k) =>
              acc && typeof acc === 'object'
                ? (acc as ReportRecord)[k]
                : undefined,
            tr,
          ),
      )
      .join('#');

    nextMoreData[key] = [...(nextMoreData[key] || []), tr];
  });

  return nextMoreData;
};

const parseCellNumber = (text?: string | null) => {
  const recordValue = Number.parseFloat(text?.replace(/,/g, '') || '0');
  return Number.isNaN(recordValue) ? 0 : recordValue;
};

const hideZeroRows = (
  root: HTMLElement,
  excludedIndexes: Set<number>,
  unhideZero?: boolean,
) => {
  const rows = root.querySelectorAll('tr');

  rows.forEach((row, rowIndex) => {
    const htmlRow = row as HTMLTableRowElement;
    htmlRow.style.display = '';

    if (unhideZero || rowIndex <= 1) {
      return;
    }

    if (htmlRow.dataset.drawZero === '1') {
      return;
    }

    const hasValue = Array.from(row.querySelectorAll('td')).some(
      (td, colIndex) =>
        !excludedIndexes.has(colIndex) &&
        Math.abs(parseCellNumber(td.textContent)) > 0.005,
    );

    if (!hasValue) {
      htmlRow.style.display = 'none';
    }
  });
};

export const totalsCalc = (
  root: HTMLElement,
  groupRule?: IGroupRule,
  unhideZero?: boolean,
) => {
  const table = root.closest('table[data-slot="table"]');
  if (!table) return;

  const excludedIndexes = new Set([0, 1].concat(groupRule?.excTotal || [])); // not-sum index-үүд энд орно
  const totals: Record<string, Record<number, number>> = {};

  const rows = root.querySelectorAll('tr[data-keys]');

  rows.forEach((row) => {
    const sumKeyVals = (row as HTMLTableRowElement).dataset.keys || '';
    const sumKeys = sumKeyVals.split(',');

    const tds = row.querySelectorAll('td');

    tds.forEach((td, index) => {
      if (excludedIndexes.has(index)) return;

      const recordValue = parseCellNumber(td.textContent);

      Array.from(sumKeys).forEach((sumKey) => {
        if (!totals[sumKey]) totals[sumKey] = {};
        if (!totals[sumKey][index]) totals[sumKey][index] = 0;

        totals[sumKey][index] += recordValue;
      });
    });
  });

  // БОДОГДСОН ДҮНГ TABLE-Д ШАХАХ
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

  hideZeroRows(root, excludedIndexes, unhideZero);
};
