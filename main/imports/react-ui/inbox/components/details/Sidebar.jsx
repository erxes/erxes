import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { Button, Collapse } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { NameCard, EmptyState, Tagger } from '/imports/react-ui/common';
import { AssignBox } from '../../containers';
import { TICKET_STATUSES } from '/imports/api/tickets/constants';


const propTypes = {
  ticket: PropTypes.object.isRequired,
  commentsCount: PropTypes.number.isRequired,
  changeStatus: PropTypes.func.isRequired,
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // current ticket is open or closed
      status: props.ticket.status,

      isTaggerVisible: false,
    };

    this.changeStatus = this.changeStatus.bind(this);
  }

  // change resolved status
  changeStatus() {
    let status = TICKET_STATUSES.CLOSED;

    if (this.state.status === TICKET_STATUSES.CLOSED) {
      status = TICKET_STATUSES.OPEN;
    }

    this.setState({ status });

    // call change status method
    this.props.changeStatus(this.props.ticket._id, status, () => {});
  }

  renderStatusButton() {
    let text = 'Resolve';
    let bsStyle = 'success';
    let icon = <i className="ion-checkmark-circled" />;

    if (this.state.status === TICKET_STATUSES.CLOSED) {
      text = 'Open';
      bsStyle = 'warning';
      icon = <i className="ion-refresh" />;
    }

    return (
      <Button
        bsStyle={bsStyle}
        onClick={this.changeStatus}
        className="action-btn"
      >
        {icon} {text}
      </Button>
    );
  }

  render() {
    const { ticket, commentsCount } = this.props;
    return (
      <Wrapper.Sidebar>
        {this.renderStatusButton()}

        <Wrapper.Sidebar.Section>
          <h3>Details</h3>
          <ul className="filters no-link">
            <li>
              Opened
              <span className="counter">
                {moment(ticket.createdAt).fromNow()}
              </span>
            </li>
            <li>
              Brand
              <span className="counter">
                {ticket.brand().name}
              </span>
            </li>
            <li>
              Conversations
              <span className="counter">{commentsCount}</span>
            </li>
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <h3>
            Assigned to
            <AssignBox ticket={ticket}>
              <a href="#" className="quick-button">
                <i className="ion-gear-a" />
              </a>
            </AssignBox>
          </h3>
          <ul className="filters no-link">
            {
              !ticket.assignedUser() ?
                <EmptyState
                  icon={<i className="ion-person" />}
                  text="Not assigned yet"
                  size="small"
                /> :
                <li>
                  <NameCard user={ticket.assignedUser()} avatarSize={45} />
                </li>
            }
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <h3>Participators</h3>
          <ul className="filters no-link">
            {ticket.participatedUsers().map((user) =>
              <li key={user._id}>
                <NameCard user={user} avatarSize={45} />
              </li>
            )}
            {
              ticket.participatedUsers().length === 0 ?
                <EmptyState
                  icon={<i className="ion-at" />}
                  text="Not participated yet"
                  size="small"
                /> :
                null
            }
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <h3>
            Tags
            <a
              href="#"
              className="quick-button"
              onClick={(e) => {
                e.preventDefault();
                const { isTaggerVisible } = this.state;
                this.setState({ isTaggerVisible: !isTaggerVisible });
              }}
            >
              <i className="ion-gear-a" />
            </a>
          </h3>

          <Collapse in={this.state.isTaggerVisible}>
            <div>
              <Tagger
                type="ticket"
                targets={[this.props.ticket]}
                className="sidebar-accordion"
                event="onClick"
              />
            </div>
          </Collapse>

          <ul className="filters">
            <li>
              {ticket.tags().map((tag) =>
                <a key={tag._id}>
                  <i className="icon ion-pricetag" style={{ color: tag.colorCode }}></i>
                  {tag.name}
                </a>
              )}
            </li>
            {
              ticket.tags().length === 0 ?
                <EmptyState
                  icon={<i className="ion-pricetags" />}
                  text="Not tagged yet"
                  size="small"
                /> :
                null
            }
          </ul>
        </Wrapper.Sidebar.Section>
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
