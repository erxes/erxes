import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { IWork } from '../../types';

type Props = {
  work: IWork;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { work } = this.props;

    const {
      name,
      status,
      job,
      flow,
      product,
      inBranch,
      inDepartment,
      outBranch,
      outDepartment,
      startAt,
      count,
      intervalId,
      needProducts,
      resultProducts
    } = work;

    const date = startAt.toString().split('T');

    return (
      <tr>
        <td>{name}</td>
        <td>{status}</td>
        <td>{job ? job.label : ''}</td>
        <td>{flow ? flow.name : ''}</td>
        <td>{product ? product.name : ''}</td>
        <td>{count || 0}</td>
        <td>{inBranch}</td>
        <td>{inDepartment}</td>
        <td>{outBranch}</td>
        <td>{outDepartment}</td>
        <td>{intervalId}</td>
        <td>{(needProducts || []).length}</td>
        <td>{(resultProducts || []).length}</td>
        <td>{date[0]}</td>
      </tr>
    );
  }
}

export default Row;
