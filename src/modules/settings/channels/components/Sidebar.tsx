import {
  EmptyState,
  Icon,
  LoadMore,
  ModalTrigger,
  Spinner
} from 'modules/common/components';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ChannelForm } from '../containers';
import { IChannel, IUsers } from '../types';
import { ChannelRow } from './';

type Props = {
  channels: IChannel[],
  members: IUsers[],
  remove: ( _id: string ) => void,
  save: ({ doc }: { doc: any; }, callback: () => void, channel: IChannel) => void,
  loading: boolean,
  currentChannelId?: string,
  channelsTotalCount: number
};

class Sidebar extends Component<Props, {}> {
  static contextTypes =  {
    __: PropTypes.func
  }

  constructor(props: Props) {
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
      <HelperButtons>
        <a>
          <Icon icon="add" />
        </a>
      </HelperButtons>
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
      <LeftSidebar wide full header={this.renderSidebarHeader()}>
        <SidebarList>
          {this.renderItems()}
          <LoadMore all={channelsTotalCount} loading={loading} />
        </SidebarList>
        {loading && <Spinner />}
        {!loading && channelsTotalCount === 0 && (
            <EmptyState icon="sitemap" text="There is no channel" />
          )}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
