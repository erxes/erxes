import dayjs from 'dayjs';
import { Icon } from 'erxes-ui';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import TextInfo from 'modules/common/components/TextInfo';
import { DateWrapper } from 'modules/common/styles/main';
import { readFile, __ } from 'modules/common/utils';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

type Props = {
  history?: any;
};

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
                  <Link to="/settings/properties?type=company">
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
        {__(`View ${this.renderText(contentTypes[0])}`)}
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

    return (
      <Dropdown className="dropdown-btn" alignRight={true}>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
          <Button btnStyle="simple" size="small">
            {__('More')} <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>{renderDownloadFile()}</Dropdown.Menu>
      </Dropdown>
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
          <div>
            {history.name || '-'}
            <p>{history.status}</p>
          </div>
        </td>
        <td>
          <TextInfo textStyle="success">
            {renderValue(history.success)}
          </TextInfo>
        </td>

        <td>
          <TextInfo textStyle="success">
            {renderValue(history.updated)}
          </TextInfo>
        </td>

        <td>
          <TextInfo textStyle="danger">{renderValue(history.failed)}</TextInfo>
        </td>

        <td>{details.fullName || '-'}</td>

        <td>
          <DateWrapper>{dayjs(history.date).format('lll')}</DateWrapper>
        </td>

        <td>
          {this.renderView()}
          {this.renderAction()}
        </td>
      </tr>
    );
  }
}

export default HistoryRow;
