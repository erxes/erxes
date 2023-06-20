import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import { DateWrapper } from 'modules/common/styles/main';
import { getEnv, readFile, __ } from 'modules/common/utils';
import React from 'react';

import {
  ImportTitle,
  ImportHistoryActions
} from 'modules/settings/importExport/styles';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from 'modules/common/components/Tip';

type Props = {
  history?: any;
};

const { REACT_APP_API_URL } = getEnv();

class HistoryRow extends React.Component<Props> {
  renderAction = () => {
    const { history } = this.props;
    const { exportLink, uploadType } = history;

    const onClick = () => {
      if (uploadType === 'local') {
        return window.open(
          `${REACT_APP_API_URL}/pl:workers/read-file?key=${exportLink}`
        );
      }

      return window.open(readFile(exportLink));
    };

    if (uploadType === 'local') {
      return (
        <Button btnStyle="simple" size="small" onClick={onClick}>
          {__(`Download result`)}
        </Button>
      );
    }

    return (
      <Button btnStyle="simple" size="small" onClick={onClick}>
        {__(`Download result`)}
      </Button>
    );
  };

  renderStatus = history => {
    if (history.error) {
      return (
        <Tip placement="top" text={history.error}>
          <TextInfo textStyle="warning"> In </TextInfo>
        </Tip>
      );
    }

    return;
  };

  render() {
    const { history } = this.props;

    const renderTotal = value => {
      if (!value || value === 0) {
        return '-';
      }

      return value;
    };

    const renderStatus = data => {
      if (
        data.status === 'Done' ||
        data.percentage === 100 ||
        data.status === 'success'
      ) {
        return <TextInfo textStyle="success"> Done </TextInfo>;
      }

      if (data.value === 'inProcess') {
        return <TextInfo textStyle="warning"> In Process </TextInfo>;
      }

      if (data.value === 'failed') {
        return (
          <Tip placement="bottom" text={data.errorMsg}>
            <TextInfo textStyle="danger"> Failed </TextInfo>
          </Tip>
        );
      }

      return (
        <TextInfo textStyle="warning">
          {`${data.status}  ${data.percentage}%`}
        </TextInfo>
      );
    };

    return (
      <tr>
        <td>
          <ImportTitle>
            <h6>{history.name || '-'}</h6>
          </ImportTitle>
        </td>
        <td>
          <span>{renderStatus(history)}</span>
        </td>
        <td>
          <span>{renderTotal(history.total)}</span>
        </td>

        <td>
          <DateWrapper>{dayjs(history.date).format('lll')}</DateWrapper>
        </td>

        <td>
          <ImportHistoryActions>{this.renderAction()}</ImportHistoryActions>
        </td>
      </tr>
    );
  }
}

export default HistoryRow;
