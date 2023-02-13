import React from 'react';
import moment from 'moment';
import { __ } from '@erxes/ui/src/utils';
import { IPerform } from '../../overallWork/types';

type Props = {
  perform: IPerform;
  history: any;
};

class Row extends React.Component<Props> {
  displayDate = (date?: Date) => {
    if (!date) {
      return '';
    }

    return moment(date).format('YYYY/MM/DD HH:mm');
  };

  displayLoc = obj => {
    if (!obj) {
      return '';
    }

    return `${obj.code} - ${obj.title}`;
  };

  render() {
    const { perform } = this.props;

    const {
      overallWorkId,
      type,
      status,
      startAt,
      endAt,
      count,
      inProductsLen,
      outProductsLen,
      inBranch,
      inDepartment,
      outBranch,
      outDepartment
    } = perform;

    return (
      <tr>
        <td>{(!!overallWorkId).toString()}</td>
        <td>{type}</td>
        <td>{this.displayDate(startAt)}</td>
        <td>{this.displayDate(endAt)}</td>
        <td>{count}</td>
        <td>{inProductsLen}</td>
        <td>{outProductsLen}</td>
        <td>{this.displayLoc(inBranch)}</td>
        <td>{this.displayLoc(inDepartment)}</td>
        <td>{this.displayLoc(outBranch)}</td>
        <td>{this.displayLoc(outDepartment)}</td>

        <td>{status}</td>
      </tr>
    );
  }
}

export default Row;
