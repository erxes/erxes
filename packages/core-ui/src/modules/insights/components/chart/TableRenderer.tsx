import React from "react";
import styled from "styled-components";
import { formatNumbers } from "../../utils";
import { colors } from "@erxes/ui/src/styles";
import { ChartTable, ScrollWrapper } from "../../styles";

const SortWrapper = styled.th`
  position: relative;
  cursor: pointer;
`;

const ArrowWrapper = styled.div`
  position: absolute;
  top: 5px;
  flex-direction: column;
  gap: 3px;

  .arrow {
    position: absolute;
    left: -15px;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;

    &.up {
      border-bottom: 5px solid #bbb;
      top: 4px;

      &.active {
        border-bottom-color: ${colors.colorSecondary};
      }
    }

    &.down {
      border-top: 5px solid #bbb;
      top: 12px;

      &.active {
        border-top-color: ${colors.colorSecondary};
      }
    }
  }
`;

type IDataSet = {
  title: string;
  data: number[] | any;
  labels: string[];
  headers?: string[];
};

type Props = {
  dataset: IDataSet;
  filters: any,
  setFilter?: (fieldName: string, value: any) => void
};

const TableList = (props: Props) => {
  const { dataset: { data = [], labels = [], title, headers = [] }, filters, setFilter } = props;

  const headerRow: any = labels?.length ? [title, 'Total Count'] : headers || []
  const array = labels?.length ? labels : data || []

  const checkSortActive = (field, direction) => {

    const activeSort = (filters["sortBy"] || []).find((s) => s.field === field);

    if (activeSort && ((direction === 1 && activeSort.direction === 1) || (direction === -1 && activeSort.direction === -1))) {
      return 'active';
    }
    return '';
  };

  const sortHandler = (field, direction) => {
    const sort = [...(filters["sortBy"] || [])];

    const existingSort = sort.find((s) => s.field === field);

    let newSort;
    if (existingSort && existingSort.direction === (direction === 'asc' ? 1 : -1)) {
      newSort = sort.filter((s) => s.field !== field);
    } else {
      newSort = sort.filter((s) => s.field !== field);
      newSort.push({ field, direction: direction === 'asc' ? 1 : -1 });
    }

    if (setFilter) {
      setFilter("sortBy", newSort);
    }
  };

  const handleRowClick = (item) => {
    const { url } = item

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  const renderSorter = (label) => {
    return (
      <SortWrapper>
        <ArrowWrapper>
          <span className={`arrow up ${checkSortActive(label, 1)}`} onClick={() => sortHandler(label, 'asc')} />
          <span className={`arrow down ${checkSortActive(label, -1)}`} onClick={() => sortHandler(label, 'desc')} />
        </ArrowWrapper>
        {label}
      </SortWrapper>
    )
  }

  return (
    <ScrollWrapper>
      <ChartTable>
        <thead>
          <tr>
            {(headerRow || []).map(header => (
              <>{renderSorter(header)}</>
            ))}
          </tr>
        </thead>
        <tbody>
          {(array || []).map((item, index) => {

            if (labels?.length) {
              const formatType = title.toLowerCase().includes('time') || title?.toLowerCase().includes('duration') ? 'time' : "commarize"

              return (
                <tr key={index} onDoubleClick={() => handleRowClick(item)}>
                  <td>
                    <b>{item}</b>
                  </td>
                  <td>{formatNumbers(data[index], formatType, "x")}</td>
                </tr>
              )
            }

            if (item.hasOwnProperty('total') && !!item['total']) {
              return (
                <tr key={index} onDoubleClick={() => handleRowClick(item)}>
                  <td colSpan={item['total']}>Total</td>
                  {(headerRow || []).map(header => {
                    if (header in item) {

                      if (["count", "totalAmount", "averageAmount", "unusedAmount", "forecastAmount"].includes(header)) {
                        return <td>{formatNumbers(item[header], "commarize") || '-'}</td>;
                      }

                      if (["totalDuration", "averageDuration", "averageResponseTime", "averageCloseTime"].includes(header)) {
                        return <td>{formatNumbers(item[header], "time", "x") || '-'}</td>;
                      }

                      return (
                        <td key={header}>{item[header] || '-'}</td>
                      );
                    }
                  })}
                </tr>
              );
            }

            return (
              <tr key={index} onDoubleClick={() => handleRowClick(item)}>
                {(headerRow || []).map(header => {
                  if (header === 'description') {
                    return <td dangerouslySetInnerHTML={{ __html: item[header] }} />
                  }

                  if (["count", "totalAmount", "averageAmount", "unusedAmount", "forecastAmount"].includes(header)) {
                    return <td>{formatNumbers(item[header], "commarize") || '-'}</td>;
                  }

                  if (["totalDuration", "averageDuration", "averageResponseTime", "averageCloseTime"].includes(header)) {
                    return <td>{formatNumbers(item[header], "time", "x") || '-'}</td>;
                  }

                  return <td>{item[header] || '-'}</td>;
                })}
              </tr>
            )
          })}
        </tbody>
      </ChartTable>
    </ScrollWrapper>
  );
};

export default TableList;