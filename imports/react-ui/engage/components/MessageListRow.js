import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import { Tip, ActionButtons } from '/imports/react-ui/common';

const propTypes = {
  message: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  setLive: PropTypes.func.isRequired,
  setLiveManual: PropTypes.func.isRequired,
  setPause: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired,
};

class Row extends React.Component {
  constructor(props) {
    super(props);

    this.toggleBulk = this.toggleBulk.bind(this);
  }

  renderLink(text, className, onClick) {
    return (
      <Tip text={text} key={`${text}-${this.props.message._id}`}>
        <Button bsStyle="link" onClick={onClick}>
          <i className={className} />
        </Button>
      </Tip>
    );
  }

  renderLinks() {
    const msg = this.props.message;
    const edit = this.renderLink('Edit', 'ion-edit', this.props.edit);
    const pause = this.renderLink('Pause', 'ion-gear-a', this.props.setPause);
    const live = this.renderLink('Set live', 'ion-paper-airplane', this.props.setLive);

    if (msg.isAuto) {
      if (msg.isDraft) {
        return [edit, live];
      }

      if (msg.isLive) {
        return [edit, pause];
      }

      return [edit, live];
    }

    if (msg.isDraft) {
      return this.renderLink('Set live', 'ion-paper-airplane', this.setLiveManual);
    }
  }

  toggleBulk(e) {
    this.props.toggleBulk(this.props.message, e.target.checked);
  }

  render() {
    let status = 'sending';
    let successCount = 0;
    let failedCount = 0;

    const { message, remove } = this.props;
    const deliveryReports = Object.values(message.deliveryReports);
    const totalCount = deliveryReports.length;

    deliveryReports.forEach(report => {
      if (report.status === 'sent') {
        successCount++;
      }

      if (report.status === 'failed') {
        failedCount++;
      }
    });

    if (totalCount === successCount + failedCount) {
      status = 'sent';
    }

    return (
      <tr key={message._id}>
        <td><input type="checkbox" onChange={this.toggleBulk} /></td>
        <td>{message.title}</td>
        <td>{message.segment().name}</td>
        <td>{message.fromUser().username}</td>
        <td>{status}</td>
        <td>{totalCount}</td>
        <td>{successCount}</td>
        <td>{failedCount}</td>
        <td>{moment(message.createdDate).format('DD MMM YYYY')}</td>

        <td className="text-right">
          <ActionButtons>
            {this.renderLinks()}

            <Tip text="Delete">
              <Button bsStyle="link" onClick={remove}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
