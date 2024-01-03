import Button from '@erxes/ui/src/components/Button';
import ChannelForm from '@erxes/ui-inbox/src/settings/channels/containers/ChannelForm';
import ChannelRow from './ChannelRow';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { Header } from '@erxes/ui-settings/src/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IChannel } from '@erxes/ui-inbox/src/settings/channels/types';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import Spinner from '@erxes/ui/src/components/Spinner';

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
      <Header>
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
      <LeftSidebar
        wide={true}
        hasBorder={true}
        header={this.renderSidebarHeader()}
      >
        <SidebarList noTextColor={true} noBackground={true}>
          {this.renderItems()}
        </SidebarList>
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
