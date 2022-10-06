import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { DateWrapper } from 'modules/common/styles/main';
import { readFile, __ } from 'modules/common/utils';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  ImportTitle,
  ImportHistoryActions
} from 'modules/settings/importExport/styles';
import { renderText } from 'modules/settings/importExport/utils';
import Icon from 'modules/common/components/Icon';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from 'modules/common/components/Tip';

type Props = {
  history?: any;
};

class HistoryRow extends React.Component<Props> {
  renderView = () => {
    const { history } = this.props;

    const { contentType } = history;

    if (contentType) {
      return (
        <Dropdown className="dropdown-btn" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
            <Button btnStyle="simple" size="small">
              {__('View')} <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {contentType.map(value => {
              return (
                <li key={Math.random()}>
                  <Link to={`/contacts/${value.contentType}`}>
                    {__(`View ${renderText(value.contentType)}`)}
                  </Link>
                </li>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return (
      <Button btnStyle="simple" size="small">
        <Link to={`/contacts/${contentType}`} style={{ color: '#888' }}>
          {__(`View ${renderText(contentType)}`)}
        </Link>
      </Button>
    );
  };

  renderAction = () => {
    const { history } = this.props;

    const { contentType } = history;

    const renderDownloadFile = () => {
      const { exportLink } = history;
      return contentType.map(value => {
        return (
          <li key={Math.random()}>
            <a
              rel="noopener noreferrer"
              href={readFile(exportLink)}
              target="_blank"
            >
              {__(`Download ${renderText(value.contentType)} file`)}
            </a>
          </li>
        );
      });
    };

    return (
      <Dropdown className="dropdown-btn" alignRight={true}>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
          <Button btnStyle="simple" size="small">
            {__('Actions')} <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>{renderDownloadFile()}</Dropdown.Menu>
      </Dropdown>
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

    return (
      <TextInfo textStyle="warning">
        {`${history.status}  ${history.percentage}%`}
      </TextInfo>
    );
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
            {this.renderStatus(history)}
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
