import TextInfo from 'modules/common/components/TextInfo';
import moment from 'moment';
import * as React from 'react';
import { ILog } from '../types';

type Props = {
  log: ILog;
  changeState: (logId: string) => void;
};

class LogRow extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.changeParentState = this.changeParentState.bind(this);
  }

  changeParentState() {
    const { log, changeState } = this.props;

    changeState(log._id);
  }

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
      <tr key={log._id} onClick={this.changeParentState}>
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
