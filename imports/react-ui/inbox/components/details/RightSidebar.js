import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Label } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment';
import { Wrapper } from '/imports/react-ui/layout/components';
import { NameCard, EmptyState, Tagger } from '/imports/react-ui/common';

import { AssignBox } from '../../containers';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  messagesCount: PropTypes.number.isRequired,
};

class RightSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isTaggerVisible: false,
      isAssignerVisible: false,
    };
  }

  renderTwitterData() {
    const customer = this.props.conversation.customer || {};
    const integration = this.props.conversation.integration || {};

    if (integration.kind === 'twitter') {
      return <img src={customer.twitterData.profileImageUrl} />;
    }

    return null;
  }

  renderMessengerData() {
    const customer = this.props.conversation.customer || {};
    const integration = this.props.conversation.integration || {};

    if (integration.kind === 'messenger') {
      return customer.getMessengerCustomData().map(data => (
        <li key={data.value}>
          <span>
            {data.name}
          </span>
          <span className="counter">
            {data.value}
          </span>
        </li>
      ));
    }

    return null;
  }

  renderFacebookData() {
    const integration = this.props.conversation.integration || {};

    if (integration.kind === 'facebook') {
      const link = `http://facebook.com/${this.props.conversation.facebookData.senderId}`;
      return (
        <li>
          <span>Facebook profile</span>
          <span className="counter">
            <a target="_blank" rel="noopener noreferrer" href={link}>
              [view]
            </a>
          </span>
        </li>
      );
    }

    return null;
  }

  renderFacebookPostUrl() {
    const conversation = this.props.conversation;
    const integration = conversation.integration || {};

    if (integration.kind === 'facebook' && conversation.facebookData.kind === 'feed') {
      const link = `http://facebook.com/${conversation.facebookData.postId}`;
      return (
        <li>
          Facebook URL
          <span className="counter">
            <a target="_blank" href={link} rel="noopener noreferrer">
              [view]
            </a>
          </span>
        </li>
      );
    }

    return null;
  }

  renderPhone(phone) {
    if (phone) {
      return (
        <li>
          Phone
          <span className="counter">{phone}</span>
        </li>
      );
    }
  }

  render() {
    const { Title, QuickButtons } = Wrapper.Sidebar.Section;
    const { conversation, messagesCount } = this.props;

    const { assignedUser, tags, participatedUsers, customer = {}, integration = {} } = conversation;

    const { brand = {}, channels = [] } = integration;

    const { isAssignerVisible, isTaggerVisible } = this.state;

    return (
      <Wrapper.Sidebar>
        <Wrapper.Sidebar.Section>
          <Title>Customer details</Title>
          <ul className="sidebar-list no-link">
            <li>
              <NameCard customer={customer} avatarSize={50} />
              {this.renderTwitterData()}
            </li>

            <li>
              {customer.isUser ? <Label>user</Label> : <Label bsStyle="primary">not user</Label>}
            </li>

            {this.renderPhone(customer.phone)}
            {this.renderMessengerData()}
            {this.renderFacebookData()}
          </ul>
          <div className="box">
            <Button
              href={FlowRouter.path('customers/details', { id: customer && customer._id })}
              className="action-btn btn-sm"
            >
              View customer profile
            </Button>
          </div>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <Title>Conversation Details</Title>
          <ul className="sidebar-list no-link">
            <li>
              Opened
              <span className="counter">{moment(conversation.createdAt).fromNow()}</span>
            </li>
            <li>
              Channels
              <div className="value">
                {channels.map(c => (
                  <span key={c._id}>
                    {c.name}
                  </span>
                ))}
              </div>
            </li>
            <li>
              Brand
              <span className="counter">{brand.name}</span>
            </li>
            <li>
              Integration
              <span className="counter">{integration.kind}</span>
            </li>
            <li>
              Conversations
              <span className="counter">{messagesCount}</span>
            </li>
            {this.renderFacebookPostUrl()}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <Title>Assigned to</Title>

          <QuickButtons>
            <a
              tabIndex={0}
              className="quick-button"
              onClick={e => {
                e.preventDefault();
                this.setState({ isAssignerVisible: !isAssignerVisible });
              }}
            >
              <i className="ion-gear-a" />
            </a>
          </QuickButtons>

          <Collapse in={isAssignerVisible}>
            <div>
              <AssignBox
                targets={[conversation._id]}
                className="sidebar-accordion"
                event="onClick"
              />
            </div>
          </Collapse>
          <ul className="sidebar-list no-link">
            {!assignedUser
              ? <EmptyState
                  icon={<i className="ion-person" />}
                  text="Not assigned yet"
                  size="small"
                />
              : <li>
                  <NameCard user={assignedUser} avatarSize={45} />
                </li>}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <Title>Participators</Title>
          <ul className="sidebar-list no-link">
            {participatedUsers.map(user => (
              <li key={user._id}>
                <NameCard user={user} avatarSize={45} />
              </li>
            ))}
            {participatedUsers.length === 0
              ? <EmptyState
                  icon={<i className="ion-at" />}
                  text="Not participated yet"
                  size="small"
                />
              : null}
          </ul>
        </Wrapper.Sidebar.Section>

        <Wrapper.Sidebar.Section>
          <Title>Tags</Title>

          <QuickButtons>
            <a
              tabIndex={0}
              className="quick-button"
              onClick={e => {
                e.preventDefault();
                this.setState({ isTaggerVisible: !isTaggerVisible });
              }}
            >
              <i className="ion-gear-a" />
            </a>
          </QuickButtons>

          <Collapse in={isTaggerVisible}>
            <div>
              <Tagger
                type="conversation"
                targets={[conversation._id]}
                className="sidebar-accordion"
                event="onClick"
              />
            </div>
          </Collapse>

          <ul className="sidebar-list no-link">
            {tags.map(tag => (
              <li key={tag._id}>
                <i className="icon ion-pricetag" style={{ color: tag.colorCode }} />
                {tag.name}
              </li>
            ))}
            {tags.length === 0
              ? <EmptyState
                  icon={<i className="ion-pricetags" />}
                  text="Not tagged yet"
                  size="small"
                  linkUrl={FlowRouter.path('tags/list', { type: 'conversation' })}
                  linkText="Manage tags"
                />
              : null}
          </ul>
        </Wrapper.Sidebar.Section>
      </Wrapper.Sidebar>
    );
  }
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
