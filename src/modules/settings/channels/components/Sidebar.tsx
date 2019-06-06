import { IUser } from 'modules/auth/types';
import {
  EmptyState,
  Icon,
  LoadMore,
  ModalTrigger,
  Spinner
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import * as React from 'react';
import { ChannelForm } from '../containers';
import { IChannel } from '../types';
import { ChannelRow } from './';

type Props = {
  channels: IChannel[];
  members: IUser[];
  remove: (channelId: string) => void;
  save: (
    params: {
      doc: {
        name: string;
        description: string;
        memberIds: string[];
      };
    },
    callback: () => void,
    channel?: IChannel
  ) => void;
  loading: boolean;
  currentChannelId?: string;
  channelsTotalCount: number;
  refetchQueries: any;
};

class Sidebar extends React.Component<Props, {}> {
  renderItems = () => {
    const {
      channels,
      members,
      remove,
      save,
      currentChannelId,
      refetchQueries
    } = this.props;

    return channels.map(channel => (
      <ChannelRow
        key={channel._id}
        isActive={currentChannelId === channel._id}
        channel={channel}
        members={members}
        remove={remove}
        save={save}
        refetchQueries={refetchQueries}
      />
    ));
  };

  renderSidebarHeader() {
    const { save, members, refetchQueries } = this.props;
    const { Header } = LeftSidebar;

    const addChannel = (
      <HelperButtons>
        <a>
          <Icon icon="add" />
        </a>
      </HelperButtons>
    );

    const content = props => (
      <ChannelForm
        {...props}
        save={save}
        members={members}
        refetchQueries={refetchQueries}
      />
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
