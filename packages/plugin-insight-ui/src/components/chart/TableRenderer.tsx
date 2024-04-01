import React from 'react';
import Table from '@erxes/ui/src/components/table';
import styled from 'styled-components';

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
};

const TableList = (props: Props) => {
  const { dataset } = props;
  const { title, data, labels } = dataset;

  return (
    <ScrollWrapper>
      <Table>
        <thead>
          <tr>
            <th>Team member</th>
            <th>{title}</th>
          </tr>
        </thead>

        <tbody>
          {(labels || []).map((label, index) => (
            <tr key={index}>
              <td>
                <b>{label}</b>
              </td>
              <td>{data[index]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollWrapper>
  );
};

export default TableList;
