import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import LoadMore from 'modules/common/components/LoadMore';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import React from 'react';
import ChannelForm from '../containers/ChannelForm';
import { IChannel } from '../types';
import ChannelRow from './ChannelRow';

type Props = {
  channels: IChannel[];
  remove: (channelId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading: boolean;
  currentChannelId?: string;
  channelsTotalCount: number;
};

class Sidebar extends React.Component<Props, {}> {
  renderItems = () => {
    const { channels, remove, currentChannelId, renderButton } = this.props;

    return channels.map(channel => (
      <ChannelRow
        key={channel._id}
        isActive={currentChannelId === channel._id}
        channel={channel}
        members={channel.members}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  renderSidebarHeader() {
    const { renderButton } = this.props;
    const { Header } = LeftSidebar;

    const addChannel = (
      <HelperButtons>
        <button>
          <Icon icon="add" />
        </button>
      </HelperButtons>
    );

    const content = props => (
      <ChannelForm {...props} renderButton={renderButton} />
    );

    return (
      <Header uppercase={true}>
        {__('Channels')}
        <ModalTrigger
          title="New Channel"
          autoOpenKey="showChannelAddModal"
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
