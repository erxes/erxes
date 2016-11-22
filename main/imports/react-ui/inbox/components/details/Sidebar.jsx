import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { Button, Collapse } from 'react-bootstrap';
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
    this.props.changeStatus(this.props.conversation._id, status, () => {});
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
              Brand
              <span className="counter">
                {conversation.integration().brand().name}
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
            <AssignBox conversation={conversation}>
              <a href="#" className="quick-button">
                <i className="ion-gear-a" />
              </a>
            </AssignBox>
          </h3>
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
                targets={[this.props.conversation]}
                className="sidebar-accordion"
                event="onClick"
              />
            </div>
          </Collapse>

          <ul className="filters">
            <li>
              {conversation.tags().map((tag) =>
                <a key={tag._id}>
                  <i
                    className="icon ion-pricetag"
                    style={{ color: tag.colorCode }}
                  >
                  </i>
                  {tag.name}
                </a>
              )}
            </li>
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
