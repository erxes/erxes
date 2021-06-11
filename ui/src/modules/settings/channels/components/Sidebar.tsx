import Button from 'modules/common/components/Button';
// tslint:disable-next-line:ordered-imports
import EmptyState from 'modules/common/components/EmptyState';
// tslint:disable-next-line:ordered-imports
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
// tslint:disable-next-line:ordered-imports
import LeftSidebar from 'modules/layout/components/Sidebar';
// tslint:disable-next-line:ordered-imports
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
      <Button
        btnStyle="success"
        block={true}
        uppercase={false}
        icon="plus-circle"
      >
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
            text={__('There is no channel')}
          />
        )}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
