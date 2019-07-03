import { IUser } from 'modules/auth/types';
import {
  EmptyState,
  Icon,
  LoadMore,
  ModalTrigger,
  Spinner
} from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import React from 'react';
import { ChannelForm } from '../containers';
import { IChannel } from '../types';
import { ChannelRow } from './';

type Props = {
  channels: IChannel[];
  members: IUser[];
  remove: (channelId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading: boolean;
  currentChannelId?: string;
  channelsTotalCount: number;
};

class Sidebar extends React.Component<Props, {}> {
  renderItems = () => {
    const {
      channels,
      members,
      remove,
      currentChannelId,
      renderButton
    } = this.props;

    return channels.map(channel => (
      <ChannelRow
        key={channel._id}
        isActive={currentChannelId === channel._id}
        channel={channel}
        members={members}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  renderSidebarHeader() {
    const { members, renderButton } = this.props;
    const { Header } = LeftSidebar;

    const addChannel = (
      <HelperButtons>
        <a href="#add">
          <Icon icon="add" />
        </a>
      </HelperButtons>
    );

    const content = props => (
      <ChannelForm {...props} members={members} renderButton={renderButton} />
    );

    return (
      <Header uppercase={true}>
        {__('Channels')}
        <ModalTrigger
          title="New Channel"
          trigger={addChannel}
          content={content}
        />
      </Header>
    );
  }

  render() {
    const { loading, channelsTotalCount } = this.props;

    return (
      <LeftSidebar wide={true} full={true} header={this.renderSidebarHeader()}>
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
