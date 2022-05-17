import dayjs from 'dayjs';
import AsyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import { __ } from '@erxes/ui/src/utils';
import * as React from 'react';
import { ILog } from '../types';

const LogModalContainer = AsyncComponent(() =>
  import(
    /* webpackChunkName: "LogModalContainer" */ '../containers/LogModalContainer'
  )
);

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

    const content = () => <LogModalContainer log={log} />;
    let logType = log.type ? log.type.split(':')[1] : '';

    // due to engage -> campaign name change
    if (logType === 'engage') {
      logType = 'campaign';
    }

    return (
      <tr key={log._id}>
        <td>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        <td>{log.unicode}</td>
        <td>{logType}</td>
        <td>
          <TextInfo textStyle={actionClass}>{log.action}</TextInfo>
        </td>
        <td>{log.description}</td>
        <td>
          <div>
            <ModalTrigger
              size="xl"
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
