import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';


const propTypes = {
  tickets: PropTypes.array.isRequired,
  single: PropTypes.bool,
  changeStatus: PropTypes.func.isRequired,
  afterSave: PropTypes.func.isRequired,
  TICKET_STATUSES: PropTypes.object.isRequired,
};

class Resolver extends Component {
  constructor(props) {
    super(props);

    this.resolve = this.resolve.bind(this);
    this.open = this.open.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
  }

  resolve() {
    this.changeStatus(this.props.TICKET_STATUSES.CLOSED);
  }

  open() {
    this.changeStatus(this.props.TICKET_STATUSES.OPEN);
  }

  changeStatus(status) {
    const args = { ticketIds: _.map(this.props.tickets, '_id'), status };

    this.props.changeStatus(args, (error) => {
      if (error) {
        Alert.error('Error', error.reason);
      }

      this.props.afterSave();
    });
  }

  render() {
    const { tickets, TICKET_STATUSES } = this.props;
    const allNotClosed = _.reduce(tickets, (memo, ticket) =>
      ticket.status !== TICKET_STATUSES.CLOSED, true);

    return (
      allNotClosed
        ? <Button bsStyle="link" onClick={this.resolve}>
          <i className="ion-checkmark-circled" /> Resolve
        </Button>
        : <Button bsStyle="link" onClick={this.open}>
          <i className="ion-refresh" /> Open
        </Button>
    );
  }
}

Resolver.propTypes = propTypes;

export default Resolver;
