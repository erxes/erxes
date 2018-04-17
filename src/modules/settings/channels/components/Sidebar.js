import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import {
  Icon,
  ModalTrigger,
  EmptyState,
  LoadMore,
  Spinner
} from 'modules/common/components';
import { SidebarList as List } from 'modules/layout/styles';
import { ChannelForm } from '../containers';
import { ChannelRow } from './';
import { RightButton } from '../../styles';

const propTypes = {
  channels: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  currentChannelId: PropTypes.string,
  channelsTotalCount: PropTypes.number.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.renderItems = this.renderItems.bind(this);
  }

  renderItems() {
    const { channels, members, remove, save, currentChannelId } = this.props;

    return channels.map(channel => (
      <ChannelRow
        key={channel._id}
        isActive={currentChannelId === channel._id}
        channel={channel}
        members={members}
        remove={remove}
        save={save}
      />
    ));
  }

  renderChannelForm(props) {
    return <ChannelForm {...props} />;
  }

  renderSidebarHeader() {
    const { __ } = this.context;
    const { save, members } = this.props;
    const { Header } = LeftSidebar;

    const addChannel = (
      <RightButton>
        <Icon erxes icon="plus" />
      </RightButton>
    );

    return (
      <Header uppercase>
        {__('Channels')}
        <ModalTrigger title="New Channel" trigger={addChannel}>
          {this.renderChannelForm({ save, members })}
        </ModalTrigger>
      </Header>
    );
  }

  render() {
    const { loading, channelsTotalCount } = this.props;

    return (
      <LeftSidebar full header={this.renderSidebarHeader()}>
        <List>
          {this.renderItems()}
          <LoadMore all={channelsTotalCount} />
        </List>
        {loading && <Spinner />}
        {!loading &&
          channelsTotalCount === 0 && (
            <EmptyState icon="briefcase" text="There is no channel" />
          )}
      </LeftSidebar>
    );
  }
}

Sidebar.propTypes = propTypes;
Sidebar.contextTypes = contextTypes;

export default Sidebar;
