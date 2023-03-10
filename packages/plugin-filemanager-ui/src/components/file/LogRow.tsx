import * as React from 'react';

import { __, renderUserFullName } from '@erxes/ui/src/utils';

import TextInfo from '@erxes/ui/src/components/TextInfo';
import dayjs from 'dayjs';

type Props = {
  log: any;
};

class LogRow extends React.Component<Props> {
  render() {
    const { log } = this.props;
    let actionClass = '';

    switch (log.description) {
      case 'created':
        actionClass = 'success';
        break;
      case 'updated':
        actionClass = 'warning';
        break;
      case 'deleted':
        actionClass = 'danger';
        break;
      default:
        break;
    }

    return (
      <tr key={log._id}>
        <td>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        <td>{renderUserFullName(log.user)}</td>
        <td>{log.contentType}</td>
        <td>
          <TextInfo textStyle={actionClass}>{log.description}</TextInfo>
        </td>
      </tr>
    );
  }
}

export default LogRow;
