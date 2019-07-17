import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import TextInfo from 'modules/common/components/TextInfo';
import { __ } from 'modules/common/utils';
import moment from 'moment';
import * as React from 'react';
import { ILog } from '../types';
import LogModalContent from './LogModalContent';

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

    const content = () => <LogModalContent log={log} />;

    return (
      <tr key={log._id}>
        <td>{moment(log.createdAt).format('YYYY-MM-DD HH:mm')}</td>
        <td>{log.unicode}</td>
        <td>{log.type ? log.type : ''}</td>
        <td>
          <TextInfo textStyle={actionClass}>{log.action}</TextInfo>
        </td>
        <td>{log.description}</td>
        <td>
          <div>
            <ModalTrigger
              title={`${__('Changes')} (${log.action})`}
              trigger={
                <Button size="small">
                  <Icon icon="eye" />
                </Button>
              }
              content={content}
              dialogClassName="wide-modal"
            />
          </div>
        </td>
      </tr>
    );
  }
}

export default LogRow;
