import React from "react";
import Table from "@erxes/ui/src/components/table";
import styled from "styled-components";

const ScrollWrapper = styled.div`
  height: 50vh;
  height: calc(100vh - 100px);
  overflow: auto;
  padding: 0px 10px 0 20px;
  margin-left: -20px;
  margin-right: -10px;
  margin-top: -5px;
`;

type IDataSet = {
  title: string;
  data: number[] | any;
  labels: string[];
};

type Props = {
  dataset: IDataSet;

};

const TableList = (props: Props) => {
  const { dataset: { data = [], labels = [], title }, } = props;

  const headers: any = labels?.length ? [title?.split(" ").at(-1), 'Total Count'] : data.length > 0 ? Object.keys(data[0]) : []
  const array = labels?.length ? labels : data || []

  return (
    <ScrollWrapper>
      <Table>
        <thead>
          <tr>
            {(headers || []).map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(array || []).map((item, index) => {

            if (labels?.length) {
              return (
                <tr key={index}>
                  <td>
                    <b>{item}</b>
                  </td>
                  <td>{data[index]}</td>
                </tr>
              )
            }

            return (
              <tr key={index}>
                {(headers || []).map(header => (
                  <td key={header}>
                    {item[header] || '-'}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </Table>
    </ScrollWrapper>
  );
};

export default TableList;
