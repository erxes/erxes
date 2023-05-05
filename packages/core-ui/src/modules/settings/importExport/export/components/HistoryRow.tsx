import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import { DateWrapper } from 'modules/common/styles/main';
import { readFile, __ } from 'modules/common/utils';
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

class HistoryRow extends React.Component<Props> {
  renderAction = () => {
    const { history } = this.props;
    const { exportLink } = history;

    return (
      <Button btnStyle="simple" size="small" href={readFile(exportLink)}>
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

    const renderStatus = value => {
      if (value === 'inProcess') {
        return <TextInfo textStyle="warning"> In Process </TextInfo>;
      }

      if (value === 'failed') {
        return (
          <Tip placement="bottom" text={history.errorMsg}>
            <TextInfo textStyle="danger"> Failed </TextInfo>
          </Tip>
        );
      }

      return <TextInfo textStyle="success"> Done </TextInfo>;
    };

    return (
      <tr>
        <td>
          <ImportTitle>
            <h6>{history.name || '-'}</h6>
          </ImportTitle>
        </td>
        <td>
          <span>{renderStatus(history.status)}</span>
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
