import React from "react";
import Table from "@erxes/ui/src/components/table";
import { formatNumbers } from "../../utils";
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
  // tableType: string;
  serviceName: string;
};

const TableList = (props: Props) => {
  const { dataset: { data = [], }, } = props;

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

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
          {(data || []).map((item, index) => (
            <tr key={index}>
              {(headers || []).map(header => (
                <td key={header}>
                  {item[header] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollWrapper>
  );
};

export default TableList;
