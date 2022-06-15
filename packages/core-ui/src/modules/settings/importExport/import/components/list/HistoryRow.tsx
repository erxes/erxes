import dayjs from 'dayjs';
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
import { renderText } from 'modules/settings/importExport/utils';
import Icon from 'modules/common/components/Icon';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from 'modules/common/components/Tip';

type Props = {
  history?: any;
  removeHistory: (historyId: string, contentType: string) => void;
};

const { REACT_APP_API_URL } = getEnv();

class HistoryRow extends React.Component<Props> {
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
            {contentTypes.map(value => {
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
        <Link to={`/contacts/${contentTypes[0]}`} style={{ color: '#888' }}>
          {__(`View ${renderText(contentTypes[0])}`)}
        </Link>
      </Button>
    );
  };

  renderAction = () => {
    const { history } = this.props;
    const { attachments, contentTypes } = history;

    const renderDownloadFile = () => {
      return contentTypes.map(value => {
        const attachment = attachments[value.contentType][0];

        return (
          <li key={Math.random()}>
            <a
              rel="noopener noreferrer"
              href={readFile(attachment.url)}
              target="_blank"
            >
              {__(`Download ${renderText(value.contentType)} file`)}
            </a>
          </li>
        );
      });
    };

    const renderDownloadErrorFile = () => {
      return contentTypes.map(value => {
        const stringified = queryString.stringify({
          importHistoryId: history._id,
          contentType: value.contentType
        });

        const reqUrl = `${REACT_APP_API_URL}/pl:workers/download-import-error?${stringified}`;

        return (
          <li key={Math.random()}>
            <a rel="noopener noreferrer" href={reqUrl} target="_blank">
              {__(`Download ${renderText(value.contentType)} errors`)}
            </a>
          </li>
        );
      });
    };

    const renderDelete = () => {
      const { removeHistory } = this.props;

      return contentTypes.map(value => {
        const onClick = () => {
          removeHistory(history._id, value.contentType);
        };

        return (
          <li key={Math.random()}>
            <a onClick={onClick} href="# ">
              {__(`Delete ${renderText(value.contentType)}`)}
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
        <Dropdown.Menu>
          {renderDownloadFile()}
          {renderDownloadErrorFile()}
          {renderDelete()}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  renderStatus = history => {
    if (history.status === 'Done' || history.percentage === 100) {
      return history.contentTypes.map(value => {
        const { removed = [] } = history;

        console.log(value);

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
          <ImportHistoryActions>{this.renderAction()}</ImportHistoryActions>
        </td>
      </tr>
    );
  }
}

export default HistoryRow;
