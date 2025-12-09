import { displayNum } from "erxes-ui";

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
