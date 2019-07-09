import { TextInfo } from 'modules/common/components';
import moment from 'moment';
import * as React from 'react';
import { ILog } from '../types';

type Props = {
  log: ILog;
};

class LogRow extends React.Component<Props> {
  render() {
    const { log } = this.props;
    let actionClass = '';

    switch (log.action) {
      case 'create':
        actionClass = 'success';
        break;
      case 'update':
        actionClass = 'warning';
        break;
      case 'delete':
        actionClass = 'danger';
        break;
      default:
        break;
    }

    return (
      <tr key={log._id}>
        <td>{moment(log.createdAt).format('YYYY-MM-DD HH:mm')}</td>
        <td>{log.unicode}</td>
        <td>{log.type ? log.type : ''}</td>
        <td>
          <TextInfo textStyle={actionClass}>{log.action}</TextInfo>
        </td>
        <td>{log.description}</td>
      </tr>
    );
  }
}

export default LogRow;
