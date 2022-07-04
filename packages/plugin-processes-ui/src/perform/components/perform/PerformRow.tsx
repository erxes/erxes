import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { IPerform } from '../../types';

type Props = {
  perform: IPerform;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { perform } = this.props;

    const {
      overallWorkId,
      status,
      startAt,
      count,
      needProducts,
      resultProducts
    } = perform;

    const date = startAt.toString().split('T');

    return (
      <tr>
        <td>{overallWorkId}</td>
        <td>{status}</td>
        <td>{count || 0}</td>
        <td>{(needProducts || []).length}</td>
        <td>{(resultProducts || []).length}</td>
        <td>{date[0]}</td>
      </tr>
    );
  }
}

export default Row;
