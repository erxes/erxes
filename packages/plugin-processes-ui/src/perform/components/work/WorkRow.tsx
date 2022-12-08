import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { IWork } from '../../types';
import moment from 'moment';

type Props = {
  work: IWork;
  history: any;
};

class Row extends React.Component<Props> {
  renderLoc(obj) {
    if (!obj) {
      return '';
    }

    const value = `${obj.code} - ${obj.title}`;

    if (value.length > 20) {
      return `${value.substring(0, 20)}...`;
    }

    return value;
  }

  render() {
    const { work } = this.props;

    const {
      name,
      status,
      flow,
      inBranch,
      inDepartment,
      outBranch,
      outDepartment,
      startAt,
      dueDate,
      count,
      needProducts,
      resultProducts
    } = work;

    return (
      <tr>
        <td>{name}</td>
        <td>{status}</td>
        <td>{flow ? flow.name : ''}</td>
        <td>{count || 0}</td>
        <td>{this.renderLoc(inBranch)}</td>
        <td>{this.renderLoc(inDepartment)}</td>
        <td>{this.renderLoc(outBranch)}</td>
        <td>{this.renderLoc(outDepartment)}</td>
        <td>{(needProducts || []).length}</td>
        <td>{(resultProducts || []).length}</td>
        <td>{startAt}</td>
        <td>{moment(dueDate).format('YYYY-MM-DD HH:mm')}</td>
      </tr>
    );
  }
}

export default Row;
