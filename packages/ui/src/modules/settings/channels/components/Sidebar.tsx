import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
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

    const addChannel = (
      <Button btnStyle="success" block={true} icon="plus-circle">
        Add New Channel
      </Button>
    );

    const content = props => (
      <ChannelForm {...props} renderButton={renderButton} />
    );

    return (
      <TopHeader>
        <ModalTrigger
          title="New Channel"
          autoOpenKey="showChannelAddModal"
          trigger={addChannel}
          content={content}
        />
      </TopHeader>
    );
  }

  render() {
    const { loading, channelsTotalCount } = this.props;

    return (
      <LeftSidebar wide={true} full={true} header={this.renderSidebarHeader()}>
        <SidebarList>{this.renderItems()}</SidebarList>
        {loading && <Spinner />}
        {!loading && channelsTotalCount === 0 && (
          <EmptyState
            image="/images/actions/18.svg"
            text="There is no channel"
          />
        )}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
