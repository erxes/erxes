import dayjs from 'dayjs';
import AsyncComponent from 'modules/common/components/AsyncComponent';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import TextInfo from 'modules/common/components/TextInfo';
import { __ } from 'modules/common/utils';
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

    return (
      <tr key={log._id}>
        <td>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        <td>{log.unicode}</td>
        <td>{log.type ? log.type : ''}</td>
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
