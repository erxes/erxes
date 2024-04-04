import Table from '@erxes/ui/src/components/table';
import React from 'react';

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

  const sliceArrayBy12 = (arr) => {
    const slicedArray: any = [];
    for (var i = 0; i < arr.length; i += 12) {
      slicedArray.push(arr.slice(i, i + 12));
    }
    return slicedArray;
  };

  const getSlicedData = sliceArrayBy12(data);
  const getSlicedLabels = sliceArrayBy12(labels);

  return (
    <Table>
      <thead>
        <tr>
          <th>Team member</th>
          <th>{title}</th>
        </tr>
      </thead>

      <tbody>
        {labels.map((label, index) => (
          <tr>
            <td>
              <b>{label}</b>
            </td>
            <td>{data[index]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TableList;
