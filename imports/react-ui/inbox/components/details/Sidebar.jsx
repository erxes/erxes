import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { Button, Collapse } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { Wrapper } from '/imports/react-ui/layout/components';
import { NameCard, EmptyState, Tagger } from '/imports/react-ui/common';
import { AssignBox } from '../../containers';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  messagesCount: PropTypes.number.isRequired,
  changeStatus: PropTypes.func.isRequired,
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // current conversation is open or closed
      status: props.conversation.status,

      isTaggerVisible: false,
      isAssignerVisible: false,
    };

    this.changeStatus = this.changeStatus.bind(this);
  }

  // change resolved status
  changeStatus() {
    let status = CONVERSATION_STATUSES.CLOSED;

    if (this.state.status === CONVERSATION_STATUSES.CLOSED) {
      status = CONVERSATION_STATUSES.OPEN;
    }

    this.setState({ status });

    // call change status method
    this.props.changeStatus(this.props.conversation._id, status, () => {
      if (this.state.status === CONVERSATION_STATUSES.CLOSED) {
        Alert.success('The conversation has been resolved!');
      } else {
        Alert.info('The conversation has been reopened and restored to Inbox.');
      }
    });
  }

  renderStatusButton() {
    let text = 'Resolve';
    let bsStyle = 'success';
    let icon = <i className="ion-checkmark-circled" />;

    if (this.state.status === CONVERSATION_STATUSES.CLOSED) {
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
    const { conversation, messagesCount } = this.props;
    const integration = conversation.integration();

    return (
      <Wrapper.Sidebar>
        {this.renderStatusButton()}

        <Wrapper.Sidebar.Section>
          <h3>Details</h3>
          <ul className="filters no-link">
            <li>
              Opened
              <span className="counter">
                {moment(conversation.createdAt).fromNow()}
              </span>
            </li>
            <li>
              Channels
              <div className="value">
                {integration.channels().map(c => (<span key={c._id}>{c.name}</span>))}
              </div>
            </li>
            <li>
              Brand
              <span className="counter">
                {integration.brand().name}
              </span>
            </li>
            <li>
              Integration
              <span className="counter">
                {integration.kind}
              </span>
            </li>
            <li>
              Conversations
              <span className="counter">{messagesCount}</span>
            </li>
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <h3>
            Assigned to
            <a
              href="#"
              className="quick-button"
              onClick={(e) => {
                e.preventDefault();
                const { isAssignerVisible } = this.state;
                this.setState({ isAssignerVisible: !isAssignerVisible });
              }}
            >
              <i className="ion-gear-a" />
            </a>
          </h3>

          <Collapse in={this.state.isAssignerVisible}>
            <div>
              <AssignBox
                targets={[conversation._id]}
                className="sidebar-accordion"
                event="onClick"
              />
            </div>
          </Collapse>
          <ul className="filters no-link">
            {
              !conversation.assignedUser() ?
                <EmptyState
                  icon={<i className="ion-person" />}
                  text="Not assigned yet"
                  size="small"
                /> :
                <li>
                  <NameCard user={conversation.assignedUser()} avatarSize={45} />
                </li>
            }
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <h3>Participators</h3>
          <ul className="filters no-link">
            {conversation.participatedUsers().map((user) =>
              <li key={user._id}>
                <NameCard user={user} avatarSize={45} />
              </li>
            )}
            {
              conversation.participatedUsers().length === 0 ?
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
                type="conversation"
                targets={[this.props.conversation._id]}
                className="sidebar-accordion"
                event="onClick"
              />
            </div>
          </Collapse>

          <ul className="filters no-link">
            {conversation.tags().map((tag) =>
              <li key={tag._id}>
                <i className="icon ion-pricetag" style={{ color: tag.colorCode }} />
                {tag.name}
              </li>
            )}
            {
              conversation.tags().length === 0 ?
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
