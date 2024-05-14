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
  const { dataset, serviceName } = props;
  const { title, data, labels } = dataset;

  const headerTitle =
    serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  const formatType =
    title && title.toLowerCase().includes("time") ? "time" : "commarize";

  return (
    <ScrollWrapper>
      <Table>
        <thead>
          <tr>
            <th>{headerTitle}</th>
            <th>{title}</th>
          </tr>
        </thead>

        <tbody>
          {(
            (labels || [])
              .map((label, index) => ({ label, value: data[index] }))
              .sort((a, b) => b.value - a.value) || []
          ).map(({ label, value }, index) => (
            <tr key={index}>
              <td>
                <b>{label}</b>
              </td>
              <td>{formatNumbers(value, "x", formatType)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollWrapper>
  );
};

export default TableList;
