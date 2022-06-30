import React from 'react';
import { __ } from '@erxes/ui/src/utils';

import { IOverallWork } from '../../types';

type Props = {
  overallWork: IOverallWork;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { overallWork } = this.props;

    const {
      status,
      job,
      flow,
      inBranch,
      inDepartment,
      outBranch,
      outDepartment,
      startAt,
      interval,
      needProducts,
      resultProducts
    } = overallWork;

    const date = startAt.toString().split('T');

    return (
      <tr>
        <td>{job ? job.label : ''}</td>
        <td>{flow ? flow.name : ''}</td>
        <td>{status}</td>
        <td>{inBranch}</td>
        <td>{inDepartment}</td>
        <td>{outBranch}</td>
        <td>{outDepartment}</td>
        <td>{interval ? interval.name : ''}</td>
        <td>{(needProducts || []).length}</td>
        <td>{(resultProducts || []).length}</td>
        <td>{date[0]}</td>
      </tr>
    );
  }
}

export default Row;
