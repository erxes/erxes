import React, { useEffect, useRef, useState } from 'react'
import { PivotTable, ScrollWrapper } from "../../styles";

type Props = {
  dataset: any;
};

const PivotTableRenderer = (props: Props) => {
  const { dataset } = props;

  const { headers = [], body = [], rowAttributes = [] } = dataset || {}

  const [tableHeaders, setTableHeaders] = useState<any[]>([]);
  const [tableBody, setTableBody] = useState<any[]>([]);

  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    setTableHeaders(headers);
    setTableBody(body);
  }, [headers?.length, body?.length]);

  useEffect(() => {

    if (!tableRef.current) return;

    const rowElements = tableRef.current?.querySelectorAll<HTMLTableRowElement>("tr");
    let leftOffsets: { [key: number]: number } = {};
    let leftOffset = 0;

    rowElements.forEach((row, rowIndex) => {
      const children = Array.from(row.children) as HTMLTableCellElement[];
      const rowNodes = children.slice(0, rowAttributes.length);

      rowNodes.forEach((node, nodeIndex) => {
        if (node.classList.contains("sticky-col")) {

          const width = node.getBoundingClientRect().width;

          if (leftOffsets[nodeIndex] !== undefined) {
            node.style.left = `${leftOffsets[nodeIndex]}px`;
          } else {
            node.style.left = `${leftOffset}px`;
            leftOffsets[nodeIndex] = leftOffset;
            leftOffset += width;
          }

          if (node.classList.contains("subTotal") && leftOffsets[nodeIndex - 1] !== undefined) {
            node.style.left = `${leftOffsets[nodeIndex - 1]}px`;
          }
        }
      });
    });

  }, [rowAttributes.length, tableHeaders.length, tableBody.length]);

  return (
    <ScrollWrapper>
      <PivotTable ref={tableRef} $bordered={true} $condensed={true}>
        <thead>
          {(tableHeaders || []).map((headerRow, headerRowIndex) => (
            <tr key={headerRowIndex}>
              {(headerRow || []).map((header, headerIndex) => {
                if (!header || header.rowspan === 0 || header.colspan === 0) {
                  return null;
                }

                return (
                  <th
                    rowSpan={header.rowspan || undefined}
                    colSpan={header.colspan || undefined}
                    className={header.className || ""}
                  >
                    {header.content}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {(tableBody || []).map((bodyRow, bodyRowIndex) => (
            <tr key={bodyRowIndex}>
              {(bodyRow || []).map((cell) => {
                if (!cell || cell.rowspan === 0 || cell.colspan === 0) {
                  return <td className={cell?.className || ''} style={{ display: 'none' }} />
                }

                return (
                  <td
                    rowSpan={cell.rowspan || undefined}
                    colSpan={cell.colspan || undefined}
                    className={cell.className || ""}
                  >
                    {cell.content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </PivotTable>
    </ScrollWrapper>
  );
};

export default PivotTableRenderer;
