import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import { DateWrapper } from 'modules/common/styles/main';
import { readFile, __ } from 'modules/common/utils';
import React from 'react';
import Icon from 'modules/common/components/Icon';

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
    if (history.status === 'Done' || history.percentage === 100) {
      return history.contentTypes.map(value => {
        const { removed = [] } = history;

        const isRemoved = removed.find(
          removedItem => removedItem === value.contentType
        );

        if (isRemoved) {
          return (
            <span key={Math.random()}>{value.contentType}(deleted) &nbsp;</span>
          );
        } else {
          return <span key={Math.random()}>{value.contentType} &nbsp;</span>;
        }
      });
    }

    if (history.error) {
      return (
        <Tip placement="top" text={history.error}>
          <TextInfo textStyle="danger"> failed </TextInfo>
        </Tip>
      );
    }

    return;
  };

  render() {
    const { history } = this.props;

    const { user = {} } = history;
    const { details = {} } = user || {};

    const renderValue = value => {
      if (!value || value === 0) {
        return '-';
      }

      return value;
    };

    return (
      <tr>
        <td>
          <ImportTitle>
            <h6>{history.name || '-'}</h6>
          </ImportTitle>
        </td>
        <td>
          <span>{renderValue(history.success)}</span>
        </td>
        <td>{details.fullName || '-'}</td>

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
