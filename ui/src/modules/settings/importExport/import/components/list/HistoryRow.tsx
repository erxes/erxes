import dayjs from 'dayjs';
import { Icon, TextInfo } from 'erxes-ui';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { DateWrapper } from 'modules/common/styles/main';
import { getEnv, readFile, __ } from 'modules/common/utils';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import {
  ImportTitle,
  ImportHistoryActions
} from 'modules/settings/importExport/styles';

type Props = {
  history?: any;
};

const { REACT_APP_API_URL } = getEnv();

class HistoryRow extends React.Component<Props> {
  renderText = value => {
    switch (value) {
      case 'customer':
        return 'Customers';
      case 'company':
        return 'Companies';
      case 'deal':
        return 'Deals';
      case 'ticket':
        return 'Tickets';
      case 'task':
        return 'Tasks';
      default:
        return value;
    }
  };

  renderView = () => {
    const { history } = this.props;

    const { contentTypes } = history;

    if (contentTypes.length > 1) {
      return (
        <Dropdown className="dropdown-btn" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
            <Button btnStyle="simple" size="small">
              {__('View')} <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {contentTypes.map(contentType => {
              return (
                <li key={Math.random()}>
                  <Link to={`/contacts/${contentType}`}>
                    {__(`View ${this.renderText(contentType)}`)}
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
        <Link to={`/contacts/${contentTypes[0]}`} style={{ color: '#888' }}>
          {__(`View ${this.renderText(contentTypes[0])}`)}
        </Link>
      </Button>
    );
  };

  renderAction = () => {
    const { history } = this.props;
    const { attachments, contentTypes } = history;

    const renderDownloadFile = () => {
      return contentTypes.map(contentType => {
        const attachment = attachments[contentType][0];

        return (
          <li key={Math.random()}>
            <a
              rel="noopener noreferrer"
              href={readFile(attachment.url)}
              target="_blank"
            >
              {__(`Download ${this.renderText(contentType)} file`)}
            </a>
          </li>
        );
      });
    };

    const renderDownloadErrorFile = () => {
      return contentTypes.map(contentType => {
        const stringified = queryString.stringify({
          importHistoryId: history._id,
          contentType
        });

        const reqUrl = `${REACT_APP_API_URL}/download-import-error?${stringified}`;

        return (
          <li key={Math.random()}>
            <a rel="noopener noreferrer" href={reqUrl} target="_blank">
              {__(`Download ${this.renderText(contentType)} errors`)}
            </a>
          </li>
        );
      });
    };

    const renderDelete = () => {
      return contentTypes.map(contentType => {
        const stringified = queryString.stringify({
          importHistoryId: history._id,
          contentType
        });

        const reqUrl = `${REACT_APP_API_URL}/download-import-error?${stringified}`;

        return (
          <li key={Math.random()}>
            <a rel="noopener noreferrer" href={reqUrl} target="_blank">
              {__(`Delete ${this.renderText(contentType)}`)}
            </a>
          </li>
        );
      });
    };

    return (
      <Dropdown className="dropdown-btn" alignRight={true}>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
          <Button btnStyle="simple" size="small">
            {__('More')} <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {renderDownloadFile()}
          {renderDownloadErrorFile()}
          {renderDelete()}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  renderStatus = history => {
    if (history.status === 'Done') {
      return history.contentTypes.map(contentType => {
        return <span key={Math.random()}>{contentType}</span>;
      });
    }

    return <TextInfo textStyle="warning">{history.status}</TextInfo>;
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

        <td>
          <span>{renderValue(history.updated)}</span>
        </td>

        <td>
          <span>{renderValue(history.failed)}</span>
        </td>

        <td>{details.fullName || '-'}</td>

        <td>
          <DateWrapper>{dayjs(history.date).format('lll')}</DateWrapper>
        </td>

        <td>
          <ImportHistoryActions>
            {this.renderView()}
            {this.renderAction()}
          </ImportHistoryActions>
        </td>
      </tr>
    );
  }
}

export default HistoryRow;
